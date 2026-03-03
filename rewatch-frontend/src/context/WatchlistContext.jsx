// src/context/WatchlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "./AuthContext";
import { fetchWatchlist, saveWatchlist } from "../services/watchlistService";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const { currentUser, logout } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const watchlistRef = useRef([]); // Keep a ref for synchronous access

  // Load watchlist from backend when user is available
  const loadWatchlist = useCallback(async () => {
    if (!currentUser) {
      setWatchlist([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    const result = await fetchWatchlist(currentUser.id);
    
    if (result.success) {
      setWatchlist(result.watchlist);
      watchlistRef.current = result.watchlist;
    } else {
      if (result.status === 401) {
        logout();
      }
      setWatchlist([]);
      watchlistRef.current = [];
      setError(result.error || "Failed to load watchlist.");
    }
    setLoading(false);
  }, [currentUser, logout]);

  // Load watchlist when user changes
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Add anime to watchlist - use ref to avoid dependency on watchlist
  const addToWatchlist = useCallback(async (anime) => {
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Prevent duplicate API calls
    if (saving) {
      return { success: false, error: "Already saving" };
    }

    // Use functional update to get current state and check duplicates
    let currentWatchlistForSave = null;
    let shouldAdd = false;
    
    setWatchlist((currentWatchlist) => {
      const exists = currentWatchlist.some((w) => String(w.id) === String(anime.id));
      if (exists) {
        shouldAdd = false;
        return currentWatchlist; // Already added
      }
      shouldAdd = true;
      currentWatchlistForSave = [...currentWatchlist, anime];
      // Update ref
      watchlistRef.current = currentWatchlistForSave;
      // Optimistic update - add immediately
      return currentWatchlistForSave;
    });

    if (!shouldAdd) {
      return { success: true }; // Already added
    }

    setSaving(true);
    setError("");

    // Sync with backend using the updated list
    try {
      const result = await saveWatchlist(currentUser.id, currentWatchlistForSave);
      
      if (!result.success) {
        if (result.status === 401) logout();
        await loadWatchlist();
        setError(result.error || "Failed to update watchlist.");
        setSaving(false);
        return result;
      } else {
        setWatchlist(result.watchlist);
        watchlistRef.current = result.watchlist;
        setError("");
        setSaving(false);
        return result;
      }
    } catch (err) {
      await loadWatchlist();
      setError("Failed to update watchlist.");
      setSaving(false);
      return { success: false, error: "Failed to update watchlist." };
    }
  }, [currentUser, saving, loadWatchlist, logout]);

  // Remove anime from watchlist
  const removeFromWatchlist = useCallback(async (animeId) => {
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Prevent duplicate API calls
    if (saving) {
      return { success: false, error: "Already saving" };
    }

    setSaving(true);
    setError("");

    // Get current watchlist from ref for reliable synchronous access
    const currentWatchlist = watchlistRef.current;
    const safeWatchlist = Array.isArray(currentWatchlist) ? currentWatchlist : [];
    
    // Filter out the item to remove
    const filteredWatchlist = safeWatchlist.filter((w) => String(w.id) !== String(animeId));
    
    // Update ref immediately
    watchlistRef.current = filteredWatchlist;
    
    // Optimistic update - remove immediately from state
    setWatchlist(filteredWatchlist);

    // Use the filtered list for the API call
    const watchlistToSave = Array.isArray(filteredWatchlist) ? filteredWatchlist : [];

    // Sync with backend using the filtered list
    try {
      const result = await saveWatchlist(currentUser.id, watchlistToSave);
      
      if (!result.success) {
        if (result.status === 401) logout();
        await loadWatchlist();
        setError(result.error || "Failed to update watchlist.");
        setSaving(false);
        return result;
      } else {
        setWatchlist(result.watchlist);
        watchlistRef.current = result.watchlist; // Update ref too
        setError("");
        setSaving(false);
        return result;
      }
    } catch (err) {
      console.error("Remove from watchlist error:", err);
      // Revert on error - reload from backend
      await loadWatchlist();
      setError("Failed to update watchlist.");
      setSaving(false);
      return { success: false, error: "Failed to update watchlist." };
    }
  }, [currentUser, saving, loadWatchlist, logout]);

  // Check if anime is in watchlist
  const isInWatchlist = useCallback((animeId) => {
    return watchlist.some((w) => w.id === animeId);
  }, [watchlist]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    watchlist,
    loading,
    error,
    saving,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refreshWatchlist: loadWatchlist,
  }), [watchlist, loading, error, saving, addToWatchlist, removeFromWatchlist, isInWatchlist, loadWatchlist]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

