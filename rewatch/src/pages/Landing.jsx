import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWatchlist } from "../services/watchlistService";
import "../App.css";

function Landing() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Load watchlist count for dashboard
  useEffect(() => {
    if (currentUser) {
      setLoadingWatchlist(true);
      fetchWatchlist(currentUser.id).then((result) => {
        if (result.success) {
          setWatchlistCount(result.watchlist.length);
        }
        setLoadingWatchlist(false);
      });
    }
  }, [currentUser]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="hero-content">
            <div className="result-count">Loading...</div>
          </div>
        </header>
      </div>
    );
  }

  // If logged in, show dashboard
  if (currentUser) {
    return (
      <div className="app-page">
        <div className="page-header">
          <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
            Welcome back, {currentUser.email.split("@")[0]}!
          </h1>
          <p className="subtitle" style={{ color: "#bfbfd6", fontSize: "1.1rem", marginBottom: "32px" }}>
            Continue tracking your favorite anime
          </p>
        </div>

        <div className="content" style={{ gridTemplateColumns: "1fr", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Dashboard Cards */}
          <div className="dashboard-grid">
            <Link to="/browse" className="dashboard-card">
              <div className="dashboard-card-icon">🎬</div>
              <h3 className="dashboard-card-title">Browse Anime</h3>
              <p className="dashboard-card-description">
                Discover trending, upcoming, and search for new anime to watch
              </p>
              <div className="dashboard-card-arrow">→</div>
            </Link>

            <Link to="/watchlist" className="dashboard-card">
              <div className="dashboard-card-icon">📺</div>
              <h3 className="dashboard-card-title">My Watchlist</h3>
              <p className="dashboard-card-description">
                {loadingWatchlist
                  ? "Loading..."
                  : `${watchlistCount} ${watchlistCount === 1 ? "anime" : "anime"} in your watchlist`}
              </p>
              <div className="dashboard-card-arrow">→</div>
            </Link>

            <Link to="/trending" className="dashboard-card">
              <div className="dashboard-card-icon">🔥</div>
              <h3 className="dashboard-card-title">Trending</h3>
              <p className="dashboard-card-description">
                See what's popular right now and all-time favorites
              </p>
              <div className="dashboard-card-arrow">→</div>
            </Link>

            <Link to="/upcoming" className="dashboard-card">
              <div className="dashboard-card-icon">📅</div>
              <h3 className="dashboard-card-title">Upcoming</h3>
              <p className="dashboard-card-description">
                Check out new anime releases coming soon
              </p>
              <div className="dashboard-card-arrow">→</div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <div className="App">
      <header className="App-header">
        <div className="hero-content">
          <h1>Re:Watch</h1>
          <p className="subtitle">Track your favorite anime, your way.</p>
          <Link to="/signup">
            <button className="start-button">Get Started</button>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link
              to="/login"
              style={{
                color: "#bfbfd6",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Landing;
