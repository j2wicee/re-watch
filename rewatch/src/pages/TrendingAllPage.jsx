import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchWatchlist, saveWatchlist } from "../services/watchlistService";

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

export default function TrendingAllPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Watchlist state - loaded from backend
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Load watchlist from backend when user is available
  useEffect(() => {
    if (!currentUser) {
      setWatchlist([]);
      return;
    }

    let isCancelled = false;

    async function load() {
      setLoadingWatchlist(true);
      const result = await fetchWatchlist(currentUser.id);
      if (isCancelled) return;

      if (result.success) {
        setWatchlist(result.watchlist);
      }
      setLoadingWatchlist(false);
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [currentUser]);

  // Fetch trending anime
  useEffect(() => {
    let isCancelled = false;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("https://api.jikan.moe/v4/top/anime");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const mapped = (json?.data || []).map(mapJikanToCard);
        if (!isCancelled) setItems(mapped);
      } catch {
        if (!isCancelled) {
          setItems([]);
          setErr("Failed to load trending.");
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

  // Add to watchlist (prevent duplicates) and sync with backend
  const addToWatchlist = async (anime) => {
    if (!currentUser) return;

    const exists = watchlist.some((w) => w.id === anime.id);
    if (exists) return;

    const nextList = [...watchlist, anime];
    setWatchlist(nextList); // Optimistic update

    const result = await saveWatchlist(currentUser.id, nextList);
    if (result.success) {
      setWatchlist(result.watchlist);
    }
  };

  return (
    <div className="app-page">
      <div className="page-header">
        <h2 className="page-title">All‑Time Trending</h2>
      </div>
      {isLoading ? (
        <div className="result-count">Loading…</div>
      ) : err ? (
        <div className="result-count">{err}</div>
      ) : (
        <div className="content" style={{ gridTemplateColumns: "1fr" }}>
          <div className="anime-grid">
            {items.map((a) => {
              const inWatchlist = watchlist.some((w) => w.id === a.id);
              return (
                <div key={a.id} className="anime-card">
                  <img
                    src={a.poster}
                    alt={`${a.title} poster`}
                    style={{
                      width: "100%",
                      height: "auto",
                      aspectRatio: "220 / 300",
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  />
                  <div className="anime-card-title">{a.title}</div>
                  <div className="anime-card-meta">Year: {a.year}</div>
                  <div className="card-actions">
                    <button
                      className={`add-button${inWatchlist ? " disabled" : ""}`}
                      onClick={() => addToWatchlist(a)}
                      disabled={inWatchlist}
                    >
                      {inWatchlist ? "Added" : "Add to Watchlist"}
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
