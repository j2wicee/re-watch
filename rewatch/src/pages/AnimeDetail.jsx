import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWatchlist, saveWatchlist } from "../services/watchlistService";
import "../App.css";

/**
 * Anime Detail Page
 * 
 * Shows detailed information about a specific anime:
 * - High resolution poster
 * - Synopsis/description
 * - Episodes list
 * - Ratings (MyAnimeList score)
 * - Add to watchlist functionality
 * 
 * Data is fetched from Jikan API using the anime ID.
 */
function AnimeDetail() {
  const { id } = useParams(); // Get anime ID from URL
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [saving, setSaving] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [watchedEpisodes, setWatchedEpisodes] = useState(new Set());

  // Calculate watch status based on watched episodes
  const watchStatus = useMemo(() => {
    if (episodes.length === 0) return null;
    
    const totalEpisodes = episodes.length;
    const watchedCount = watchedEpisodes.size;
    
    if (watchedCount === 0) {
      return { status: "Not Started", color: "#8a8aa3", icon: "○" };
    } else if (watchedCount === totalEpisodes) {
      return { status: "Complete", color: "#10b981", icon: "✓" };
    } else {
      return { status: "Watching", color: "#3b82f6", icon: "▶" };
    }
  }, [episodes.length, watchedEpisodes.size]);

  // Load watchlist from backend
  useEffect(() => {
    if (!currentUser) return;

    async function loadWatchlist() {
      const result = await fetchWatchlist(currentUser.id);
      if (result.success) {
        setWatchlist(result.watchlist);
        const exists = result.watchlist.some((w) => w.id === parseInt(id));
        setIsInWatchlist(exists);
      }
    }

    loadWatchlist();
  }, [currentUser, id]);

  // Load watched episodes from localStorage
  useEffect(() => {
    if (!currentUser || !id) return;
    const key = `watched_episodes_${currentUser.id}_${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const episodeNumbers = JSON.parse(stored);
        setWatchedEpisodes(new Set(episodeNumbers));
      } catch (e) {
        console.error("Failed to parse watched episodes", e);
      }
    }
  }, [currentUser, id]);

  // Store total episode count in localStorage for card display
  useEffect(() => {
    if (!currentUser || !id || !anime || !episodes.length) return;
    const key = `anime_episodes_${currentUser.id}_${id}`;
    localStorage.setItem(key, String(episodes.length));
  }, [currentUser, id, anime, episodes.length]);

  // Fetch episodes from Jikan API
  useEffect(() => {
    if (!id || !anime) return;

    let isCancelled = false;

    async function fetchEpisodes() {
      setLoadingEpisodes(true);
      try {
        // Jikan API endpoint for anime episodes (may be paginated)
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch episodes: ${res.status}`);
        }

        const json = await res.json();
        let episodesData = json.data || [];

        // Handle pagination if needed
        if (json.pagination && json.pagination.has_next_page) {
          // For now, just use first page. Could fetch more pages if needed.
          console.log("Episodes are paginated, showing first page only");
        }

        if (!isCancelled) {
          if (episodesData.length > 0) {
            // Map episodes to a simpler format
            const mappedEpisodes = episodesData.map((ep, index) => {
              // Try to extract episode number from various sources
              let episodeNumber = ep.mal_id;
              if (!episodeNumber || typeof episodeNumber !== 'number') {
                // Try to parse from title
                const titleMatch = ep.title?.match(/Episode\s+(\d+)/i);
                if (titleMatch) {
                  episodeNumber = parseInt(titleMatch[1]);
                } else {
                  episodeNumber = index + 1;
                }
              }
              
              return {
                mal_id: ep.mal_id,
                number: episodeNumber,
                title: ep.title || `Episode ${episodeNumber}`,
                aired: ep.aired || null,
                filler: ep.filler || false,
                recap: ep.recap || false,
              };
            });
            setEpisodes(mappedEpisodes);
          } else if (anime.episodes && typeof anime.episodes === 'number' && anime.episodes > 0) {
            // Fallback: create simple list based on episode count
            const simpleEpisodes = Array.from({ length: anime.episodes }, (_, i) => ({
              mal_id: null,
              number: i + 1,
              title: `Episode ${i + 1}`,
              aired: null,
              filler: false,
              recap: false,
            }));
            setEpisodes(simpleEpisodes);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load episodes:", err);
          // If episodes endpoint fails, create a simple list based on episode count
          if (anime.episodes && typeof anime.episodes === 'number' && anime.episodes > 0) {
            const simpleEpisodes = Array.from({ length: anime.episodes }, (_, i) => ({
              mal_id: null,
              number: i + 1,
              title: `Episode ${i + 1}`,
              aired: null,
              filler: false,
              recap: false,
            }));
            setEpisodes(simpleEpisodes);
          }
        }
      } finally {
        if (!isCancelled) {
          setLoadingEpisodes(false);
        }
      }
    }

    fetchEpisodes();

    return () => {
      isCancelled = true;
    };
  }, [id, anime]);

  // Fetch anime details from Jikan API
  useEffect(() => {
    let isCancelled = false;

    async function fetchAnimeDetails() {
      setLoading(true);
      setError("");

      try {
        // Jikan API endpoint for anime by ID
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch anime details: ${res.status}`);
        }

        const json = await res.json();
        const data = json.data;

        if (!data) {
          throw new Error("Anime not found");
        }

        if (!isCancelled) {
          setAnime({
            id: data.mal_id,
            title: data.title || data.title_english || data.title_japanese || "Untitled",
            titleEnglish: data.title_english,
            titleJapanese: data.title_japanese,
            synopsis: data.synopsis || "No synopsis available.",
            poster: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url || "",
            year: data.year || data.aired?.prop?.from?.year || "Unknown",
            episodes: data.episodes || "Unknown",
            status: data.status || "Unknown",
            score: data.score || null,
            scoredBy: data.scored_by || 0,
            rank: data.rank || null,
            popularity: data.popularity || null,
            genres: data.genres?.map((g) => g.name) || [],
            studios: data.studios?.map((s) => s.name) || [],
            rating: data.rating || "N/A",
            duration: data.duration || "Unknown",
            source: data.source || "Unknown",
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load anime details.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchAnimeDetails();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Add/remove from watchlist
  const toggleWatchlist = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setSaving(true);

    if (isInWatchlist) {
      // Remove from watchlist
      const updated = watchlist.filter((item) => item.id !== anime.id);
      const result = await saveWatchlist(currentUser.id, updated);
      if (result.success) {
        setWatchlist(result.watchlist);
        setIsInWatchlist(false);
      }
    } else {
      // Add to watchlist
      const newItem = {
        id: anime.id,
        title: anime.title,
        year: anime.year,
        poster: anime.poster,
      };
      const updated = [...watchlist, newItem];
      const result = await saveWatchlist(currentUser.id, updated);
      if (result.success) {
        setWatchlist(result.watchlist);
        setIsInWatchlist(true);
      }
    }

    setSaving(false);
  };

  // Toggle watched status for an episode
  const toggleEpisodeWatched = (episodeNumber) => {
    if (!currentUser) return;

    setWatchedEpisodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(episodeNumber)) {
        newSet.delete(episodeNumber);
      } else {
        newSet.add(episodeNumber);
      }
      
      // Save to localStorage
      const key = `watched_episodes_${currentUser.id}_${id}`;
      localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
      
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="app-page">
        <div className="page-header" style={{ textAlign: "center" }}>
          <div className="result-count">Loading anime details...</div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="app-page">
        <div className="page-header" style={{ textAlign: "center" }}>
          <h2 className="page-title">Anime Not Found</h2>
          <div className="result-count" style={{ color: "#e50914", marginBottom: 20 }}>
            {error || "This anime could not be found."}
          </div>
          <Link to="/app" className="start-button" style={{ display: "inline-block" }}>
            ← Back to App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-header">
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#bfbfd6",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20,
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.15)";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.color = "#bfbfd6";
          }}
        >
          ← Back
        </button>
      </div>

      <div className="content" style={{ gridTemplateColumns: "1fr", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="anime-detail-container">
          {/* Hero Section with Poster and Main Info */}
          <div className="anime-detail-hero">
            <div className="anime-detail-poster">
              <img
                src={anime.poster}
                alt={`${anime.title} poster`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 12,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                }}
              />
            </div>

            <div className="anime-detail-info">
              <h1 className="anime-detail-title">{anime.title}</h1>
              
              {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                <p className="anime-detail-subtitle">{anime.titleEnglish}</p>
              )}
              
              {anime.titleJapanese && (
                <p className="anime-detail-subtitle-jp">{anime.titleJapanese}</p>
              )}

              {/* Action Buttons */}
              <div className="anime-detail-actions">
                <button
                  className={`start-button ${isInWatchlist ? "disabled" : ""}`}
                  onClick={toggleWatchlist}
                  disabled={saving || isInWatchlist}
                  style={{
                    marginRight: 12,
                    opacity: isInWatchlist ? 0.6 : 1,
                    cursor: isInWatchlist ? "not-allowed" : "pointer",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : isInWatchlist
                    ? "✓ In Watchlist"
                    : "+ Add to Watchlist"}
                </button>
                
                {/* Watch Status Badge */}
                {watchStatus && (
                  <div
                    className="watch-status-badge"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: `${watchStatus.color}15`,
                      border: `1px solid ${watchStatus.color}40`,
                      color: watchStatus.color,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    <span>{watchStatus.icon}</span>
                    <span>{watchStatus.status}</span>
                    {watchStatus.status === "Watching" && (
                      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        ({watchedEpisodes.size}/{episodes.length})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="anime-detail-stats">
                {anime.score && (
                  <div className="anime-stat-item">
                    <div className="anime-stat-label">Score</div>
                    <div className="anime-stat-value">{anime.score}/10</div>
                    {anime.scoredBy > 0 && (
                      <div className="anime-stat-meta">
                        {anime.scoredBy.toLocaleString()} users
                      </div>
                    )}
                  </div>
                )}

                {anime.rank && (
                  <div className="anime-stat-item">
                    <div className="anime-stat-label">Rank</div>
                    <div className="anime-stat-value">#{anime.rank}</div>
                  </div>
                )}

                {anime.popularity && (
                  <div className="anime-stat-item">
                    <div className="anime-stat-label">Popularity</div>
                    <div className="anime-stat-value">#{anime.popularity}</div>
                  </div>
                )}

                <div className="anime-stat-item">
                  <div className="anime-stat-label">Episodes</div>
                  <div className="anime-stat-value">{anime.episodes}</div>
                </div>

                <div className="anime-stat-item">
                  <div className="anime-stat-label">Year</div>
                  <div className="anime-stat-value">{anime.year}</div>
                </div>

                <div className="anime-stat-item">
                  <div className="anime-stat-label">Status</div>
                  <div className="anime-stat-value">{anime.status}</div>
                </div>
              </div>

              {/* Genres */}
              {anime.genres.length > 0 && (
                <div className="anime-detail-genres">
                  {anime.genres.map((genre, idx) => (
                    <span key={idx} className="anime-genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Synopsis Section */}
          <div className="anime-detail-section">
            <h2 className="anime-detail-section-title">Synopsis</h2>
            <p className="anime-detail-synopsis">{anime.synopsis}</p>
          </div>

          {/* Episodes Section */}
          {anime.episodes && anime.episodes !== "Unknown" && (
            <div className="anime-detail-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 className="anime-detail-section-title" style={{ margin: 0 }}>
                  Episodes
                </h2>
                {watchStatus && (
                  <div
                    className="watch-status-badge-inline"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: `${watchStatus.color}15`,
                      border: `1px solid ${watchStatus.color}40`,
                      color: watchStatus.color,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    <span>{watchStatus.icon}</span>
                    <span>{watchStatus.status}</span>
                    {watchStatus.status === "Watching" && (
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        {watchedEpisodes.size}/{episodes.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {loadingEpisodes ? (
                <div className="episodes-loading">Loading episodes...</div>
              ) : episodes.length > 0 ? (
                <div className="episodes-list">
                  {episodes.map((episode) => {
                    const episodeNumber = typeof episode.number === 'number' ? episode.number : parseInt(episode.number) || 1;
                    const isWatched = watchedEpisodes.has(episodeNumber);
                    
                    return (
                      <div
                        key={episode.mal_id || episode.number}
                        className={`episode-item ${isWatched ? "watched" : ""} ${episode.filler ? "filler" : ""} ${episode.recap ? "recap" : ""}`}
                      >
                        <label className="episode-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isWatched}
                            onChange={() => toggleEpisodeWatched(episodeNumber)}
                            className="episode-checkbox"
                          />
                          <span className="episode-number">Episode {episode.number}</span>
                        </label>
                        <div className="episode-title">{episode.title}</div>
                        {episode.filler && (
                          <span className="episode-badge filler-badge">Filler</span>
                        )}
                        {episode.recap && (
                          <span className="episode-badge recap-badge">Recap</span>
                        )}
                        {episode.aired && (
                          <div className="episode-aired">{new Date(episode.aired).toLocaleDateString()}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : typeof anime.episodes === 'number' && anime.episodes > 0 ? (
                <div className="episodes-list">
                  {Array.from({ length: anime.episodes }, (_, i) => {
                    const episodeNumber = i + 1;
                    const isWatched = watchedEpisodes.has(episodeNumber);
                    
                    return (
                      <div
                        key={episodeNumber}
                        className={`episode-item ${isWatched ? "watched" : ""}`}
                      >
                        <label className="episode-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isWatched}
                            onChange={() => toggleEpisodeWatched(episodeNumber)}
                            className="episode-checkbox"
                          />
                          <span className="episode-number">Episode {episodeNumber}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="episodes-empty">No episode information available.</div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="anime-detail-section">
            <h2 className="anime-detail-section-title">Information</h2>
            <div className="anime-detail-info-grid">
              {anime.studios.length > 0 && (
                <div className="anime-info-item">
                  <strong>Studios:</strong> {anime.studios.join(", ")}
                </div>
              )}
              <div className="anime-info-item">
                <strong>Source:</strong> {anime.source}
              </div>
              <div className="anime-info-item">
                <strong>Duration:</strong> {anime.duration}
              </div>
              <div className="anime-info-item">
                <strong>Rating:</strong> {anime.rating}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeDetail;


