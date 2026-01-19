const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Get user's watchlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("watchlist");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user's watchlist
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { watchlist } = req.body;

    // Validate input
    if (!Array.isArray(watchlist)) {
      return res.status(400).json({ error: "Watchlist must be an array" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove duplicate anime entries by `id`
    const seenIds = new Set();
    const dedupedWatchlist = [];

    for (const item of watchlist) {
      // If item has no id, keep it (or you could choose to skip)
      if (!item || item.id === undefined || item.id === null) {
        dedupedWatchlist.push(item);
        continue;
      }

      const animeId = String(item.id);
      if (!seenIds.has(animeId)) {
        seenIds.add(animeId);
        dedupedWatchlist.push(item);
      }
    }

    user.watchlist = dedupedWatchlist;
    await user.save();

    res.json({ watchlist: dedupedWatchlist });
  } catch (error) {
    console.error("Update watchlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
