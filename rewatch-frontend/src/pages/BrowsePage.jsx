// src/pages/BrowsePage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import SearchBar from "../components/SearchBar";
import AnimeCard from "../components/AnimeCard";
import CardSkeleton from "../components/CardSkeleton";

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

function BrowsePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Search input and debounced text
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");

  // Section data
  const [trendingAllTime, setTrendingAllTime] = useState([]);
  const [trendingCurrent, setTrendingCurrent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  // Master lists - persistent data that doesn't get cleared
  const [searchResultsMaster, setSearchResultsMaster] = useState([]);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  // Loading and errors
  const [loadingTrendingAll, setLoadingTrendingAll] = useState(false);
  const [loadingTrendingCurrent, setLoadingTrendingCurrent] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorTrendingAll, setErrorTrendingAll] = useState("");
  const [errorTrendingCurrent, setErrorTrendingCurrent] = useState("");
  const [errorUpcoming, setErrorUpcoming] = useState("");
  const [errorSearch, setErrorSearch] = useState("");

  // Use shared watchlist context
  const { watchlist, loading: loadingWatchlist, error: errorWatchlist, addToWatchlist: addToWatchlistContext } = useWatchlist();

  // Redirect to login if not authenticated (but wait for auth check to finish)
  useEffect(() => {
    // Don't redirect while we're still checking auth status from localStorage
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

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
      // Don't clear master list, just update query - keeps results visible
      setCurrentSearchQuery("");
      setErrorSearch("");
      setLoadingSearch(false);
      return;
    }
    
    // Only fetch if query changed - prevents unnecessary refetches
    if (debouncedText === currentSearchQuery) {
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
        if (!isCancelled) {
          // Update master list - this persists even during watchlist updates
          // Master list ensures cards don't disappear when watchlist state changes
          setSearchResultsMaster(mapped);
          setCurrentSearchQuery(debouncedText);
        }
      } catch {
        if (!isCancelled) {
          setErrorSearch("Failed to fetch results.");
          // Don't clear master list on error - keep previous results visible
        }
      } finally {
        if (!isCancelled) setLoadingSearch(false);
      }
    }
    run();
    return () => {
      isCancelled = true;
    };
  }, [debouncedText, currentSearchQuery]);

  // Add to watchlist using shared context
  const addToWatchlist = async (anime) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    await addToWatchlistContext(anime);
  };

  // Whether search mode is active
  const searchActive = useMemo(() => debouncedText.length > 0, [debouncedText]);

  // Derived search results from master list - never disappears during updates
  const searchResults = useMemo(() => {
    if (!searchActive) return [];
    // Return master list - it persists through watchlist updates
    return searchResultsMaster;
  }, [searchActive, searchResultsMaster]);

  // Memoize the sliced arrays to prevent creating new arrays on every render
  const trendingAllTimeSlice = useMemo(() => trendingAllTime.slice(0, 5), [trendingAllTime]);
  const trendingCurrentSlice = useMemo(() => trendingCurrent.slice(0, 5), [trendingCurrent]);
  const upcomingSlice = useMemo(() => upcoming.slice(0, 5), [upcoming]);

  // Stable callback that doesn't change
  const handleAddToWatchlist = useCallback((anime) => {
    addToWatchlist(anime);
  }, [addToWatchlist]);

  // Memoized Section component - only re-renders when its own items or watchlist status for THOSE items changes
  const Section = React.memo(({
    title,
    viewAllTo,
    items,
    loading,
    error,
    emptyMessage,
    watchlist,
    onAddToWatchlist,
  }) => {
    return (
      <section className="anime-section">
        <div className="section-header">
          <h3 className="section-title">{title}</h3>
          <Link to={viewAllTo} className="view-all-button">
            <span>View All</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="anime-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : error ? (
          <div className="section-error">{error}</div>
        ) : items.length === 0 ? (
          <div className="section-empty">{emptyMessage}</div>
        ) : (
          <div className="anime-grid">
            {items.map((anime, index) => {
              // Direct check like TrendingAllPage - no memoization
              const inWatchlist = watchlist.some((w) => String(w.id) === String(anime.id));
              return (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  inWatchlist={inWatchlist}
                  index={index}
                  onAddToWatchlist={onAddToWatchlist}
                />
              );
            })}
          </div>
        )}
      </section>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if items, loading, or error changed
    if (
      prevProps.items !== nextProps.items ||
      prevProps.loading !== nextProps.loading ||
      prevProps.error !== nextProps.error
    ) {
      return false; // Re-render needed
    }
    
    // Check if watchlist status changed for ANY item in THIS section
    // Create sets for quick lookup
    const prevWatchlistIds = new Set(prevProps.watchlist.map(w => String(w.id)));
    const nextWatchlistIds = new Set(nextProps.watchlist.map(w => String(w.id)));
    
    // Only re-render if a watchlist status changed for items in this section
    for (const item of nextProps.items) {
      const id = String(item.id);
      const wasInWatchlist = prevWatchlistIds.has(id);
      const isInWatchlist = nextWatchlistIds.has(id);
      if (wasInWatchlist !== isInWatchlist) {
        return false; // Re-render needed - status changed for this section
      }
    }
    
    // Watchlist changed but not for items in this section - no re-render needed
    return true;
  });

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
        <h2 className="page-title">Browse Anime</h2>
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
              : `Showing ${searchResultsMaster.length} result${
                  searchResultsMaster.length === 1 ? "" : "s"
                } for "${debouncedText}"`
            : "Browse sections below"}
        </div>
      </div>

      <div className="content" style={{ gridTemplateColumns: "1fr" }}>
        <div className="grid-column">
          {searchActive ? (
            <Section
              title="Search Results"
              viewAllTo="/browse"
              items={searchResults}
              loading={loadingSearch}
              error={errorSearch}
              emptyMessage={`No results for "${debouncedText}".`}
              watchlist={watchlist}
              onAddToWatchlist={handleAddToWatchlist}
            />
          ) : (
            <>
              <Section
                title="All‑Time Trending"
                viewAllTo="/trending"
                items={trendingAllTimeSlice}
                loading={loadingTrendingAll}
                error={errorTrendingAll}
                emptyMessage="No all‑time trending anime available."
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
              />
              <Section
                title="Current Trending"
                viewAllTo="/trending-current"
                items={trendingCurrentSlice}
                loading={loadingTrendingCurrent}
                error={errorTrendingCurrent}
                emptyMessage="No current trending anime found."
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
              />
              <Section
                title="Upcoming Anime"
                viewAllTo="/upcoming"
                items={upcomingSlice}
                loading={loadingUpcoming}
                error={errorUpcoming}
                emptyMessage="No upcoming anime found."
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowsePage;

