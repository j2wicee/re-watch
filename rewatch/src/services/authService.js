/**
 * Authentication Service (frontend)
 *
 * This file is responsible for talking to the Express/MongoDB backend
 * for all auth-related actions (signup, login, logout).
 *
 * The backend exposes:
 * - POST /signup  -> { success, user: { id, email } } or { error }
 * - POST /login   -> { success, user: { id, email } } or { error }
 *
 * We also keep a copy of the logged-in user in localStorage so the
 * session survives page refreshes. Passwords are NEVER stored here.
 */

// Base URL for the backend API.
// You can override this in .env with REACT_APP_API_BASE_URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Key used to persist the current user in localStorage
const CURRENT_USER_KEY = "rewatch_currentUser";

/**
 * Helper to safely parse a JSON string.
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Sign up a new user by calling the backend.
 * Returns { success: boolean, user: {id, email} | null, error: string | null }
 */
export async function signup(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      // Prefer backend error message if available
      return {
        success: false,
        user: null,
        error: data.error || "Signup failed. Please try again.",
      };
    }

    // Persist the logged-in user so it survives refreshes
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

    return { success: true, user: data.user, error: null };
  } catch (err) {
    console.error("Signup request failed:", err);
    return {
      success: false,
      user: null,
      error: "Network error during signup. Please try again.",
    };
  }
}

/**
 * Log in an existing user via the backend.
 * Returns { success: boolean, user: {id, email} | null, error: string | null }
 */
export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      return {
        success: false,
        user: null,
        error: data.error || "Login failed. Please check your credentials.",
      };
    }

    // Persist the logged-in user so it survives refreshes
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

    return { success: true, user: data.user, error: null };
  } catch (err) {
    console.error("Login request failed:", err);
    return {
      success: false,
      user: null,
      error: "Network error during login. Please try again.",
    };
  }
}

/**
 * Log out the current user.
 * We only need to clear localStorage on the frontend.
 */
export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Get the current logged-in user from localStorage.
 * This is used by AuthContext to rehydrate state on page load.
 */
export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  const user = raw ? safeJsonParse(raw) : null;
  // Basic shape check – we expect at least id + email
  if (user && user.id && user.email) {
    return user;
  }
  return null;
}

/**
 * Convenience helper to know if a user is logged in.
 */
export function isAuthenticated() {
  return !!getCurrentUser();
}
