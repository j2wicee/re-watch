/**
 * Admin/Development Routes
 *
 * WARNING: These routes expose sensitive data and should be removed
 * or protected with authentication in production!
 *
 * These are useful for development/debugging to verify data is being stored.
 */

const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * GET /admin/users
 * List all users (without passwords)
 *
 * Example: http://localhost:5000/admin/users
 */
router.get("/users", async (req, res) => {
  try {
    // Find all users, exclude passwordHash field
    const users = await User.find({}).select("-passwordHash").lean();

    res.json({
      count: users.length,
      users: users.map((user) => ({
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        watchlistCount: user.watchlist ? user.watchlist.length : 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /admin/users/:userId
 * Get a specific user's details (without password)
 *
 * Example: http://localhost:5000/admin/users/1234567890abcdef
 */
router.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-passwordHash").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      watchlist: user.watchlist || [],
      watchlistCount: user.watchlist ? user.watchlist.length : 0,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * GET /admin/stats
 * Get database statistics
 *
 * Example: http://localhost:5000/admin/stats
 */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const usersWithWatchlist = await User.countDocuments({
      watchlist: { $exists: true, $ne: [] },
    });
    const totalWatchlistItems = await User.aggregate([
      { $unwind: { path: "$watchlist", preserveNullAndEmptyArrays: true } },
      { $count: "total" },
    ]);

    res.json({
      totalUsers,
      usersWithWatchlist,
      totalWatchlistItems: totalWatchlistItems[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
