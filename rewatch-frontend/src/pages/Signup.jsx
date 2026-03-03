import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../App.css";

/**
 * Signup Page Component
 * - Calls the backend /signup endpoint
 * - Automatically logs the user in on success
 * - Validates passwords and shows network errors
 */
function Signup() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match before hitting the backend
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Call auth service which talks to the Express/MongoDB backend
      const result = await signup(email, password);

      if (result.success) {
        // Update auth context (user is auto-logged in after signup)
        setCurrentUser(result.user);
        // Redirect to app page
        navigate("/app");
      } else {
        setError(result.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("Unexpected error during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <div
        className="page-header"
        style={{ textAlign: "center", maxWidth: 400, margin: "40px auto" }}
      >
        <h2 className="page-title" style={{ marginBottom: 24 }}>
          Sign Up for Re:Watch
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {error && (
            <div
              style={{
                padding: 12,
                backgroundColor: "rgba(229, 9, 20, 0.2)",
                border: "1px solid #e50914",
                borderRadius: 8,
                color: "#fff",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 6, color: "#bfbfd6" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #3a3a50",
                outline: "none",
                backgroundColor: "#1c1c2b",
                color: "#f0f0ff",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: 6, color: "#bfbfd6" }}
            >
              Password (min. 6 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #3a3a50",
                outline: "none",
                backgroundColor: "#1c1c2b",
                color: "#f0f0ff",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              style={{ display: "block", marginBottom: 6, color: "#bfbfd6" }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #3a3a50",
                outline: "none",
                backgroundColor: "#1c1c2b",
                color: "#f0f0ff",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="start-button"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: 8,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ color: "#bfbfd6" }}>Already have an account? </span>
          <Link
            to="/login"
            style={{ color: "#667eea", textDecoration: "none" }}
          >
            Log in
          </Link>
        </div>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link to="/" style={{ color: "#bfbfd6", textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
