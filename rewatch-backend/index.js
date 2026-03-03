require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const watchlistRoutes = require("./routes/watchlist");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: allow your frontend origin. Add FRONTEND_URL in Railway if using a different URL.
const allowedOrigins = [
  "https://re-watch-gamma.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production";
      cb(null, ok ? origin : false);
    },
    optionsSuccessStatus: 204,
  })
);
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});
