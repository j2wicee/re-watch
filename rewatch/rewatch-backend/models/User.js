const mongoose = require("mongoose");

// Shape of a single watchlist item
const watchlistItemSchema = new mongoose.Schema(
  {
    id: { type: String }, // anime ID from your API/frontend
    title: { type: String },
    year: { type: Number },
    poster: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  watchlist: {
    type: [watchlistItemSchema],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
