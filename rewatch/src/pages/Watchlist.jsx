import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import AnimeCard from "../components/AnimeCard";
import "../App.css";

/*
  Watchlist page
  - Fetches the user's watchlist from the backend (MongoDB) on first render
  - Lets the user remove items and persists changes via the backend
  - Uses the same Netflix-like styles already defined in App.css
*/
function Watchlist() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Use shared watchlist context
  const { watchlist, loading, error, removeFromWatchlist: removeFromWatchlistContext, saving } = useWatchlist();
  const removingRef = useRef(new Set()); // Track which items are being removed

  // Redirect to login if not authenticated (but wait for auth check to finish)
  useEffect(() => {
    // Don't redirect while we're still checking auth status from localStorage
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  // Remove an item from the watchlist using shared context
  const handleRemove = async (animeId) => {
    if (!currentUser) return;
    
    // Prevent duplicate removals
    const animeIdStr = String(animeId);
    if (removingRef.current.has(animeIdStr) || saving) {
      return;
    }
    
    removingRef.current.add(animeIdStr);
    try {
      await removeFromWatchlistContext(animeId);
    } finally {
      // Remove from tracking after a delay to prevent rapid re-clicks
      setTimeout(() => {
        removingRef.current.delete(animeIdStr);
      }, 500);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="app-page">
        <div className="page-header" style={{ textAlign: "center" }}>
          <div className="watchlist-empty">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
          My Watchlist
        </h1>
        <div className="watchlist-count" style={{ fontSize: "1.1rem", marginBottom: "24px" }}>
          {loading
            ? "Loading..."
            : `${watchlist.length} ${watchlist.length === 1 ? "anime" : "anime"} saved`}
        </div>
        {saving && !loading && (
          <div
            style={{
              color: "#bfbfd6",
              marginBottom: 16,
              padding: "8px 16px",
              background: "rgba(102, 126, 234, 0.1)",
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            Saving changes…
          </div>
        )}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e50914",
              backgroundColor: "rgba(229, 9, 20, 0.15)",
              color: "#fff",
              maxWidth: "600px",
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div className="content" style={{ gridTemplateColumns: "1fr", maxWidth: "1400px", margin: "0 auto" }}>
        {loading ? (
          <div className="watchlist-loading">
            <div className="loading-spinner"></div>
            <p>Loading your watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="watchlist-empty-state">
            <div className="empty-state-icon">📺</div>
            <h2>Your watchlist is empty</h2>
            <p>Start adding anime to your watchlist to keep track of what you want to watch!</p>
            <Link to="/app" className="start-button" style={{ marginTop: 24, display: "inline-block" }}>
              Browse Anime
            </Link>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((anime, index) => (
              <div 
                key={anime.id} 
                className="watchlist-card-wrapper"
                style={{ position: "relative" }}
              >
                <AnimeCard
                  anime={anime}
                  inWatchlist={true}
                  index={index}
                  onAddToWatchlist={() => {}}
                  showWatchStatus={true}
                />
                <button
                  className="watchlist-card-remove"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(anime.id);
                  }}
                  disabled={saving || removingRef.current.has(String(anime.id))}
                  title="Remove from watchlist"
                  aria-label="Remove from watchlist"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
