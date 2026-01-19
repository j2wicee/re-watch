import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Brand (click to go Home) */}
        <Link to="/" className="nav-brand">
          Re:Watch
        </Link>

        {/* Links */}
        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Home
          </NavLink>
          {currentUser && (
            <>
              <NavLink
                to="/app"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                App
              </NavLink>
              <NavLink
                to="/watchlist"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Watchlist
              </NavLink>
            </>
          )}
          {currentUser ? (
            <>
              <span style={{ color: "#bfbfd6", margin: "0 8px" }}>
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
