const mongoose = require("mongoose");

/**
 * MongoDB connection helper
 *
 * Uses the MONGODB_URI environment variable if set,
 * otherwise falls back to a local MongoDB instance.
 */
async function connectDB() {
  // Support both MONGODB_URI and MONGO_URI for flexibility
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/rewatch";

  try {
    await mongoose.connect(uri, {
      // These options are defaults in newer mongoose versions but kept for clarity
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n📝 To fix this:");
    console.error(
      "   1. Install MongoDB locally: https://www.mongodb.com/try/download/community"
    );
    console.error(
      "   2. OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    );
    console.error(
      "   3. OR set MONGODB_URI environment variable with your connection string"
    );
    console.error(
      "\n   Example: MONGODB_URI=mongodb://localhost:27017/rewatch node index.js"
    );
    process.exit(1);
  }
}

module.exports = connectDB;
