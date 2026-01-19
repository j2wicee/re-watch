// src/pages/AppPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import { fetchWatchlist, saveWatchlist } from "../services/watchlistService";

// Helper to normalize Jikan items for our UI
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

function AppPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Search input and debounced text
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");

  // Section data
  const [trendingAllTime, setTrendingAllTime] = useState([]);
  const [trendingCurrent, setTrendingCurrent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  // Search results
  const [searchResults, setSearchResults] = useState([]);

  // Loading and errors
  const [loadingTrendingAll, setLoadingTrendingAll] = useState(false);
  const [loadingTrendingCurrent, setLoadingTrendingCurrent] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorTrendingAll, setErrorTrendingAll] = useState("");
  const [errorTrendingCurrent, setErrorTrendingCurrent] = useState("");
  const [errorUpcoming, setErrorUpcoming] = useState("");
  const [errorSearch, setErrorSearch] = useState("");

  // Watchlist is now stored in MongoDB via the backend.
  // We still keep a copy in React state for instant UI updates.
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [errorWatchlist, setErrorWatchlist] = useState("");

  // Redirect to login if not authenticated (but wait for auth check to finish)
  useEffect(() => {
    // Don't redirect while we're still checking auth status from localStorage
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  // Load watchlist from backend when the user is available
  useEffect(() => {
    if (!currentUser) {
      setWatchlist([]);
      return;
    }

    let isCancelled = false;

    async function load() {
      setLoadingWatchlist(true);
      setErrorWatchlist("");
      const result = await fetchWatchlist(currentUser.id);
      if (isCancelled) return;

      if (result.success) {
        setWatchlist(result.watchlist);
      } else {
        setWatchlist([]);
        setErrorWatchlist(result.error || "Failed to load watchlist.");
      }
      setLoadingWatchlist(false);
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [currentUser]);

  // Debounce search input (350ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedText(searchText.trim()), 350);
    return () => clearTimeout(t);
  }, [searchText]);

  // Fetch all sections sequentially to respect Jikan API rate limits (3 requests/second)
  // This single useEffect makes calls one after another with delays between them
  useEffect(() => {
    let isCancelled = false;

    async function fetchAllSequentially() {
      // Helper function to delay between calls
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // 1) Fetch All-Time Trending first
      setLoadingTrendingAll(true);
      setErrorTrendingAll("");
      try {
        const res1 = await fetch("https://api.jikan.moe/v4/top/anime");
        if (!res1.ok) throw new Error(`HTTP ${res1.status}`);
        const json1 = await res1.json();
        const mapped1 = (json1?.data || []).map(mapJikanToCard);
        if (!isCancelled) setTrendingAllTime(mapped1);
      } catch (e) {
        if (!isCancelled) {
          setTrendingAllTime([]);
          setErrorTrendingAll("Failed to load all-time trending.");
        }
      } finally {
        if (!isCancelled) setLoadingTrendingAll(false);
      }

      // Wait 1 second before next call (respects rate limit)
      await delay(1000);

      // 2) Fetch Current Trending
      if (isCancelled) return;
      setLoadingTrendingCurrent(true);
      setErrorTrendingCurrent("");
      try {
        const res2 = await fetch("https://api.jikan.moe/v4/seasons/now");
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
        const json2 = await res2.json();
        const mapped2 = (json2?.data || []).map(mapJikanToCard);
        if (!isCancelled) setTrendingCurrent(mapped2);
      } catch (e) {
        if (!isCancelled) {
          setTrendingCurrent([]);
          setErrorTrendingCurrent("Failed to load current trending.");
        }
      } finally {
        if (!isCancelled) setLoadingTrendingCurrent(false);
      }

      // Wait 1 more second before final call
      await delay(1000);

      // 3) Fetch Upcoming Anime (next season)
      if (isCancelled) return;
      setLoadingUpcoming(true);
      setErrorUpcoming("");
      try {
        const res3 = await fetch("https://api.jikan.moe/v4/seasons/upcoming");
        if (!res3.ok) throw new Error(`HTTP ${res3.status}`);
        const json3 = await res3.json();
        const mapped3 = (json3?.data || []).map(mapJikanToCard);
        if (!isCancelled) setUpcoming(mapped3);
      } catch (e) {
        if (!isCancelled) {
          setUpcoming([]);
          setErrorUpcoming("Failed to load upcoming anime.");
        }
      } finally {
        if (!isCancelled) setLoadingUpcoming(false);
      }
    }

    fetchAllSequentially();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch Search Results when debounced text exists
  useEffect(() => {
    if (!debouncedText) {
      setSearchResults([]);
      setErrorSearch("");
      setLoadingSearch(false);
      return;
    }
    let isCancelled = false;
    async function run() {
      setLoadingSearch(true);
      setErrorSearch("");
      try {
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          debouncedText
        )}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const mapped = (json?.data || []).map(mapJikanToCard);
        if (!isCancelled) setSearchResults(mapped);
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
          setErrorSearch("Failed to fetch results.");
        }
      } finally {
        if (!isCancelled) setLoadingSearch(false);
      }
    }
    run();
    return () => {
      isCancelled = true;
    };
  }, [debouncedText]);

  // Add to watchlist (prevent duplicates) and sync with backend.
  // We optimistically update the UI first for a responsive feel.
  const addToWatchlist = async (anime) => {
    if (!currentUser) return;

    const exists = watchlist.some((w) => w.id === anime.id);
    if (exists) return;

    const nextList = [...watchlist, anime];
    setWatchlist(nextList); // Optimistic update

    const result = await saveWatchlist(currentUser.id, nextList);
    if (!result.success) {
      // Keep the optimistic list but surface the error to the user
      setErrorWatchlist(result.error || "Failed to update watchlist.");
    } else {
      // Use canonical list from backend (also ensures no duplicates)
      setWatchlist(result.watchlist);
      setErrorWatchlist("");
    }
  };

  // Whether search mode is active
  const searchActive = useMemo(() => debouncedText.length > 0, [debouncedText]);

  // A reusable Section that shows a title + "View All" link and a wrapping grid of cards
  const Section = ({
    title,
    viewAllTo,
    items,
    loading,
    error,
    emptyMessage,
  }) => {
    return (
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <Link
            to={viewAllTo}
            style={{ color: "#bfbfd6", textDecoration: "none" }}
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ color: "#bfbfd6" }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#bfbfd6" }}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{ color: "#bfbfd6" }}>{emptyMessage}</div>
        ) : (
          <div
            className="anime-grid"
            style={{
              // ensure wrapping grid that grows with screen size
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {items.map((anime) => {
              const inWatchlist = watchlist.some((w) => w.id === anime.id);
              return (
                <div key={anime.id} className="anime-card">
                  <img
                    src={anime.poster}
                    alt={`${anime.title} poster`}
                    style={{
                      width: "100%",
                      height: "auto",
                      aspectRatio: "220 / 300",
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  />
                  <div className="anime-card-title">{anime.title}</div>
                  <div className="anime-card-meta">Year: {anime.year}</div>
                  <div className="card-actions">
                    <button
                      className={`add-button${inWatchlist ? " disabled" : ""}`}
                      onClick={() => addToWatchlist(anime)}
                      disabled={inWatchlist}
                    >
                      {inWatchlist ? "Added" : "Add to Watchlist"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="app-page">
        <div className="page-header">
          <div className="result-count">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-header">
        <h2 className="page-title">Re:Watch — App Page</h2>
        <div className="watchlist-count">
          Watchlist: {watchlist.length} item{watchlist.length === 1 ? "" : "s"}
          {loadingWatchlist && " (loading…)"}
        </div>
        {errorWatchlist && (
          <div
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #e50914",
              backgroundColor: "rgba(229, 9, 20, 0.2)",
              color: "#fff",
            }}
          >
            {errorWatchlist}
          </div>
        )}
        <SearchBar value={searchText} onChange={setSearchText} />
        <div className="result-count">
          {searchActive
            ? loadingSearch
              ? "Searching…"
              : errorSearch
              ? errorSearch
              : `Showing ${searchResults.length} result${
                  searchResults.length === 1 ? "" : "s"
                } for "${debouncedText}"`
            : "Browse sections below"}
        </div>
      </div>

      <div className="content" style={{ gridTemplateColumns: "1fr" }}>
        <div className="grid-column">
          {searchActive ? (
            <Section
              title="Search Results"
              viewAllTo="/app" // already on search; no separate view-all for this mode
              items={searchResults}
              loading={loadingSearch}
              error={errorSearch}
              emptyMessage={`No results for "${debouncedText}".`}
            />
          ) : (
            <>
              <Section
                title="All‑Time Trending"
                viewAllTo="/trending"
                items={trendingAllTime.slice(0, 5)}
                loading={loadingTrendingAll}
                error={errorTrendingAll}
                emptyMessage="No all‑time trending anime available."
              />
              <Section
                title="Current Trending"
                viewAllTo="/trending-current"
                items={trendingCurrent.slice(0, 5)}
                loading={loadingTrendingCurrent}
                error={errorTrendingCurrent}
                emptyMessage="No current trending anime found."
              />
              <Section
                title="Upcoming Anime"
                viewAllTo="/upcoming"
                items={upcoming.slice(0, 5)}
                loading={loadingUpcoming}
                error={errorUpcoming}
                emptyMessage="No upcoming anime found."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppPage;
