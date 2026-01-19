import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Landing() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="hero-content">
          <h1>Re:Watch</h1>
          <p className="subtitle">Track your favorite anime, your way.</p>
          {/* Link changes the URL to /app without reloading the page */}
          <Link to="/app">
            <button className="start-button">Start Tracking</button>
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Landing;
