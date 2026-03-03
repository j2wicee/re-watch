import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as authLogout } from "../services/authService";

/**
 * AuthContext provides authentication state to the entire app
 * - currentUser: The logged-in user object or null
 * - setCurrentUser: Function to update the current user
 * - loading: Whether we're checking auth status
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from localStorage on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Logout function that clears both context and localStorage
  const logout = () => {
    authLogout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}






