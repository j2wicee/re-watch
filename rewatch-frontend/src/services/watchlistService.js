/**
 * Watchlist Service
 *
 * Frontend helper for talking to the backend watchlist endpoints:
 * - GET  /watchlist/:userId -> { watchlist: [...] }
 * - POST /watchlist/:userId -> { watchlist: [...] }
 *
 * Requires JWT in Authorization header. Each watchlist item: { id, title, year, poster }
 */

import { getToken } from "./authService";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function authHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/**
 * Fetch the current user's watchlist from the backend.
 */
export async function fetchWatchlist(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/watchlist/${userId}`, {
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        watchlist: [],
        error: data.error || "Failed to load watchlist.",
        status: res.status,
      };
    }

    return {
      success: true,
      watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
      error: null,
    };
  } catch (err) {
    console.error("Fetch watchlist failed:", err);
    return {
      success: false,
      watchlist: [],
      error: "Network error while loading watchlist.",
    };
  }
}

/**
 * Save the user's watchlist to the backend.
 * The backend will also de-duplicate items by id.
 */
export async function saveWatchlist(userId, watchlist) {
  try {
    // Ensure watchlist is always an array
    const safeWatchlist = Array.isArray(watchlist) ? watchlist : [];
    
    const res = await fetch(`${API_BASE_URL}/watchlist/${userId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ watchlist: safeWatchlist }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        watchlist,
        error: data.error || "Failed to save watchlist.",
        status: res.status,
      };
    }

    return {
      success: true,
      watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
      error: null,
    };
  } catch (err) {
    console.error("Save watchlist failed:", err);
    return {
      success: false,
      watchlist,
      error: "Network error while saving watchlist.",
    };
  }
}


