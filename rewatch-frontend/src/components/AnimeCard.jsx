// src/components/AnimeCard.jsx
import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AnimeCard = React.memo(({ anime, inWatchlist, index, onAddToWatchlist, showWatchStatus = false }) => {
  const { currentUser } = useAuth();

  // Calculate watch status from localStorage
  const watchStatus = useMemo(() => {
    if (!currentUser || !anime.id) return null;

    try {
      const key = `watched_episodes_${currentUser.id}_${anime.id}`;
      const stored = localStorage.getItem(key);
      if (!stored) return { status: "Not Started", color: "#8a8aa3", icon: "○" };

      const watchedEpisodes = JSON.parse(stored);
      if (!Array.isArray(watchedEpisodes) || watchedEpisodes.length === 0) {
        return { status: "Not Started", color: "#8a8aa3", icon: "○" };
      }

      // We don't have total episodes on the card, so we can't determine "Complete"
      // But we can show "Watching" if there are watched episodes
      // For "Complete", we'd need to fetch episode count, which is expensive
      // So we'll show "Watching" if there are any watched episodes
      return { status: "Watching", color: "#3b82f6", icon: "▶", count: watchedEpisodes.length };
    } catch (e) {
      return null;
    }
  }, [currentUser, anime.id]);

  // Try to get total episodes from localStorage (stored when viewing detail page)
  const totalEpisodes = useMemo(() => {
    if (!currentUser || !anime.id) return null;
    try {
      const key = `anime_episodes_${currentUser.id}_${anime.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const count = parseInt(stored);
        if (!isNaN(count) && count > 0) return count;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }, [currentUser, anime.id]);

  // Update watch status if we have total episodes
  const finalWatchStatus = useMemo(() => {
    if (!watchStatus) return null;
    
    if (totalEpisodes && watchStatus.count) {
      if (watchStatus.count >= totalEpisodes) {
        return { status: "Complete", color: "#10b981", icon: "✓" };
      }
    }
    
    return watchStatus;
  }, [watchStatus, totalEpisodes]);

  const handleAddClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inWatchlist) {
      onAddToWatchlist(anime);
    }
  }, [anime, inWatchlist, onAddToWatchlist]);

  // Determine card class based on watch status (if shown) or watchlist status
  const cardClassName = useMemo(() => {
    if (showWatchStatus && finalWatchStatus) {
      // Use status-based class when showing watch status
      // Convert "Not Started" to "not-started", "Watching" to "watching", "Complete" to "complete"
      const statusClass = finalWatchStatus.status.toLowerCase().replace(/\s+/g, '-');
      return `anime-card status-${statusClass}`;
    } else if (inWatchlist) {
      // Default to "added" class if in watchlist but not showing status
      return "anime-card added";
    }
    return "anime-card";
  }, [showWatchStatus, finalWatchStatus, inWatchlist]);

  return (
    <div
      className={cardClassName}
      style={{ 
        animationDelay: `${index * 0.05}s`,
        // Prevent layout shifts
        minHeight: '100%'
      }}
    >
      {/* Only show added indicator if not showing watch status (to avoid conflicts with remove button) */}
      {inWatchlist && !showWatchStatus && (
        <div className="added-indicator" aria-label="In watchlist">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M15 4.5L6.75 12.75L3 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      
      {/* Watch Status Badge - Only show if showWatchStatus prop is true */}
      {showWatchStatus && finalWatchStatus && (
        <div
          className="card-watch-status-badge"
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: `${finalWatchStatus.color}20`,
            border: `1px solid ${finalWatchStatus.color}50`,
            color: finalWatchStatus.color,
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            zIndex: 10,
            backdropFilter: "blur(4px)",
          }}
          title={finalWatchStatus.status}
        >
          <span style={{ fontSize: "0.7rem" }}>{finalWatchStatus.icon}</span>
          <span>{finalWatchStatus.status}</span>
        </div>
      )}
      <Link
        to={`/anime/${anime.id}`}
        className="anime-card-link"
      >
        <div className="anime-poster-container">
          <img
            src={anime.poster}
            alt={`${anime.title} poster`}
            className="anime-poster"
            loading="lazy"
          />
          {inWatchlist && (
            <div className="poster-overlay">
              <div className="overlay-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M11.667 3.5L5.25 9.917L2.333 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>In Watchlist</span>
              </div>
            </div>
          )}
        </div>
        <div className="anime-card-content">
          <div className="anime-card-title">{anime.title}</div>
          <div className="anime-card-meta">Year: {anime.year}</div>
        </div>
      </Link>
      <div className="card-actions">
        <button
          className={`add-button ${inWatchlist ? "added" : ""}`}
          onClick={handleAddClick}
          disabled={inWatchlist}
          aria-label={inWatchlist ? "Already in watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.333 4L6 11.333L2.667 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>In Watchlist</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.333V12.667M3.333 8H12.667"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Add to Watchlist</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if anime ID or watchlist status changes
  // This prevents unnecessary re-renders when other props change
  if (prevProps.anime.id !== nextProps.anime.id) {
    return false; // Different anime - re-render needed
  }
  
  // Same anime - only re-render if watchlist status or showWatchStatus changed
  return prevProps.inWatchlist === nextProps.inWatchlist && 
         prevProps.showWatchStatus === nextProps.showWatchStatus;
});

AnimeCard.displayName = "AnimeCard";

export default AnimeCard;

