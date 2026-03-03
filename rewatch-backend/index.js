require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const watchlistRoutes = require("./routes/watchlist");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - restrict CORS in production when FRONTEND_URL is set
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : {};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Rewatch Backend!" });
});

app.use("/", authRoutes); // /signup, /login
app.use("/watchlist", watchlistRoutes); // /watchlist/:userId
// Admin routes disabled in production for security
if (process.env.NODE_ENV !== "production") {
  app.use("/admin", adminRoutes); // /admin/users, /admin/stats (dev only)
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
