// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Landing from "./pages/Landing";
import BrowsePage from "./pages/BrowsePage";
import Watchlist from "./pages/Watchlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TrendingAllPage from "./pages/TrendingAllPage";
import TrendingCurrentPage from "./pages/TrendingCurrentPage";
import UpcomingPage from "./pages/UpcomingPage";
import AnimeDetail from "./pages/AnimeDetail";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/app" element={<BrowsePage />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/trending" element={<TrendingAllPage />} />
            <Route path="/trending-current" element={<TrendingCurrentPage />} />
            <Route path="/upcoming" element={<UpcomingPage />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
          </Routes>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
