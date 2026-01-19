// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import Watchlist from "./pages/Watchlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TrendingAllPage from "./pages/TrendingAllPage";
import TrendingCurrentPage from "./pages/TrendingCurrentPage";
import UpcomingPage from "./pages/UpcomingPage";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/trending" element={<TrendingAllPage />} />
          <Route path="/trending-current" element={<TrendingCurrentPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
