import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWatchlist, saveWatchlist } from "../services/watchlistService";
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

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated (but wait for auth check to finish)
  useEffect(() => {
    // Don't redirect while we're still checking auth status from localStorage
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  // Fetch watchlist from backend when we have a user
  useEffect(() => {
    if (!currentUser) return;

    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      const result = await fetchWatchlist(currentUser.id);
      if (isCancelled) return;

      if (result.success) {
        setWatchlist(result.watchlist);
      } else {
        setWatchlist([]);
        setError(result.error || "Failed to load watchlist.");
      }
      setLoading(false);
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [currentUser]);

  // Remove an item from the watchlist and sync with backend.
  // We optimistically update the UI first for a snappy feel.
  const removeFromWatchlist = async (animeId) => {
    if (!currentUser) return;
    setError("");

    const updated = watchlist.filter((item) => item.id !== animeId);
    setWatchlist(updated); // Optimistic update
    setSaving(true);

    const result = await saveWatchlist(currentUser.id, updated);
    setSaving(false);

    if (!result.success) {
      // If saving failed, show an error and re-sync from backend next time.
      setError(result.error || "Failed to update watchlist.");
    } else {
      // Use the canonical list from the backend (also ensures no duplicates)
      setWatchlist(result.watchlist);
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
      <div className="page-header" style={{ textAlign: "center" }}>
        <h2 className="page-title">Your Watchlist</h2>
        <div className="watchlist-count">
          Total: {watchlist.length} item{watchlist.length === 1 ? "" : "s"}
        </div>
        {loading && (
          <div style={{ color: "#bfbfd6", marginTop: 4 }}>
            Loading watchlist…
          </div>
        )}
        {saving && !loading && (
          <div style={{ color: "#bfbfd6", marginTop: 4 }}>Saving changes…</div>
        )}
        {error && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #e50914",
              backgroundColor: "rgba(229, 9, 20, 0.2)",
              color: "#fff",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <Link to="/" style={{ color: "#bfbfd6", marginRight: 12 }}>
            ← Home
          </Link>
          <Link to="/app" style={{ color: "#bfbfd6" }}>
            Go to App
          </Link>
        </div>
      </div>

      {/* Single-column list using existing sidebar list styles */}
      <div className="content" style={{ gridTemplateColumns: "1fr" }}>
        <div className="watchlist" style={{ position: "relative", top: 0 }}>
          {loading ? (
            <div className="watchlist-empty">Loading…</div>
          ) : watchlist.length === 0 ? (
            <div className="watchlist-empty">Your watchlist is empty.</div>
          ) : (
            <ul className="watchlist-list">
              {watchlist.map((anime) => {
                const poster =
                  anime.poster ||
                  "https://via.placeholder.com/80x110.png?text=Poster";
                return (
                  <li
                    key={anime.id}
                    className="watchlist-item"
                    style={{ gridTemplateColumns: "auto 1fr auto" }}
                  >
                    <img
                      src={poster}
                      alt={`${anime.title} poster`}
                      style={{
                        width: 64,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <div>
                      <div className="watchlist-item-title">{anime.title}</div>
                      <div className="watchlist-item-meta">
                        Year: {anime.year}
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeFromWatchlist(anime.id)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
