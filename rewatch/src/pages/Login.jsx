import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../App.css";

/**
 * Login Page Component
 * - Calls the backend /login endpoint
 * - On success, updates AuthContext and redirects to the main app
 * - Shows loading and error states for better UX
 */
function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call auth service which talks to the Express/MongoDB backend
      const result = await login(email, password);

      if (result.success) {
        // Store the user in global auth context (and localStorage via the service)
        setCurrentUser(result.user);
        // Redirect to app page
        navigate("/app");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      // This should be rare since login() already catches, but it's safe to guard
      console.error("Unexpected login error:", err);
      setError("Unexpected error during login. Please try again.");
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
          Log In to Re:Watch
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ color: "#bfbfd6" }}>Don't have an account? </span>
          <Link
            to="/signup"
            style={{ color: "#667eea", textDecoration: "none" }}
          >
            Sign up
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

export default Login;
