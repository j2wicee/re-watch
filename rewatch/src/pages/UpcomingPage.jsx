import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";

function mapJikanToCard(item) {
  const id = item?.mal_id ?? Math.random();
  const title =
    item?.title || item?.title_english || item?.title_japanese || "Untitled";
  const year = item?.year || item?.aired?.prop?.from?.year || "Unknown";
  const poster =
    item?.images?.jpg?.image_url ||
    "https://via.placeholder.com/220x300.png?text=Anime+Poster";
  return { id, title, year, poster };
}

export default function UpcomingPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Use shared watchlist context
  const { watchlist, addToWatchlist: addToWatchlistContext } = useWatchlist();

  // Fetch upcoming anime
  useEffect(() => {
    let isCancelled = false;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("https://api.jikan.moe/v4/seasons/upcoming");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const mapped = (json?.data || []).map(mapJikanToCard);
        if (!isCancelled) setItems(mapped);
      } catch {
        if (!isCancelled) {
          setItems([]);
          setErr("Failed to load upcoming anime.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    run();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Add to watchlist using shared context
  const addToWatchlist = async (anime) => {
    if (!currentUser) return;
    await addToWatchlistContext(anime);
  };

  return (
    <div className="app-page">
      <div className="page-header">
        <h2 className="page-title">Upcoming Anime</h2>
      </div>
      {isLoading ? (
        <div className="result-count">Loading…</div>
      ) : err ? (
        <div className="result-count">{err}</div>
      ) : (
        <div className="content" style={{ gridTemplateColumns: "1fr" }}>
          <div className="anime-grid">
            {items.map((a, index) => {
              const inWatchlist = watchlist.some((w) => String(w.id) === String(a.id));
              return (
                <div
                  key={a.id}
                  className={`anime-card ${inWatchlist ? "added" : ""}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {inWatchlist && (
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
                  <Link
                    to={`/anime/${a.id}`}
                    className="anime-card-link"
                  >
                    <div className="anime-poster-container">
                      <img
                        src={a.poster}
                        alt={`${a.title} poster`}
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
                      <div className="anime-card-title">{a.title}</div>
                      <div className="anime-card-meta">Year: {a.year}</div>
                    </div>
                  </Link>
                  <div className="card-actions">
                    <button
                      className={`add-button ${inWatchlist ? "added" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!inWatchlist) {
                          addToWatchlist(a);
                        }
                      }}
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
