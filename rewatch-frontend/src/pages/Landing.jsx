import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWatchlist } from "../services/watchlistService";
import "../App.css";

function Landing() {
  const { currentUser, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [totalEpisodesWatched, setTotalEpisodesWatched] = useState(0);
  const [seriesCompleted, setSeriesCompleted] = useState(0);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Load watchlist and stats for dashboard
  useEffect(() => {
    if (currentUser) {
      setLoadingWatchlist(true);
      fetchWatchlist(currentUser.id).then((result) => {
        if (result.success) {
          const list = result.watchlist;
          setWatchlist(list);

          const userId = String(currentUser.id);
          const watchedPrefix = `watched_episodes_${userId}_`;
          const totalPrefix = `anime_episodes_${userId}_`;

          // Scan ALL localStorage keys for this user's watched episodes (handles ID format inconsistencies)
          let total = 0;
          const watchedCountByAnimeId = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(watchedPrefix)) continue;
            const animeId = key.slice(watchedPrefix.length);
            try {
              const arr = JSON.parse(localStorage.getItem(key) || "[]");
              const count = Array.isArray(arr) ? arr.length : 0;
              total += count;
              watchedCountByAnimeId[animeId] = count;
            } catch {
              /* ignore */
            }
          }

          setTotalEpisodesWatched(total);

          let completed = 0;
          for (const anime of list) {
            const idStr = String(anime.id);
            const watchedCount = watchedCountByAnimeId[idStr] ?? watchedCountByAnimeId[anime.id] ?? 0;
            if (watchedCount === 0) continue;
            const totalKey = `${totalPrefix}${idStr}`;
            const altTotalKey = `${totalPrefix}${anime.id}`;
            const totalStored = localStorage.getItem(totalKey) || localStorage.getItem(altTotalKey);
            const totalEpisodes = totalStored ? parseInt(totalStored, 10) : 0;
            if (totalEpisodes > 0 && watchedCount >= totalEpisodes) completed++;
          }
          setSeriesCompleted(completed);
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
          <p className="subtitle" style={{ color: "#bfbfd6", fontSize: "1.1rem", marginBottom: 12 }}>
            Continue tracking your favorite anime
          </p>
          <p className="dashboard-intro">
            Pick an option below to dive in — browse to discover new shows, check your watchlist to pick your next watch,
            or explore what's trending and coming soon.
          </p>

          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">{totalEpisodesWatched}</span>
              <span className="dashboard-stat-label">Episodes watched</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">{seriesCompleted}</span>
              <span className="dashboard-stat-label">Completed</span>
            </div>
          </div>

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
                  : `${watchlist.length} ${watchlist.length === 1 ? "anime" : "anime"} in your watchlist`}
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

        <div className="content" style={{ gridTemplateColumns: "1fr", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="dashboard-footer">
            <p className="dashboard-tip">
              💡 Use the <strong>Browse</strong> page to search for anime and add titles to your watchlist.
              On each anime's detail page you can track which episodes you've watched.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <div className="App">
      <header className="App-header landing-header">
        <div className="hero-content landing-hero">
          <h1>Re:Watch</h1>
          <p className="subtitle">Track your favorite anime, your way.</p>
          <p className="landing-tagline">
            Never lose track of where you left off. Build your watchlist, discover trending and upcoming anime,
            and keep all your favorites in one place.
          </p>

          <div className="landing-features">
            <div className="landing-feature">
              <span className="landing-feature-icon">📺</span>
              <span>Track episodes & watch status</span>
            </div>
            <div className="landing-feature">
              <span className="landing-feature-icon">📋</span>
              <span>Build & manage your watchlist</span>
            </div>
            <div className="landing-feature">
              <span className="landing-feature-icon">🔍</span>
              <span>Discover trending & upcoming</span>
            </div>
          </div>

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
