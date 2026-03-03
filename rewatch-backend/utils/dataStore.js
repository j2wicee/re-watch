/**
 * In-Memory Data Store
 *
 * This module provides a simple in-memory storage solution.
 * Data is stored in memory and will be lost when the server restarts.
 *
 * This is perfect for learning Node.js and Express before moving to a database.
 * When you're ready, you can replace these functions with database queries.
 */

// In-memory storage
let users = [];
let watchlists = {}; // { userId: [watchlist items] }

//User data functions
function getUsers() {
  return users;
}
function saveUsers(newUsers) {
  users = newUsers;
}

function addUser(user) {
  users.push(user);
}

//Watchlist data functions
function getWatchlists() {
  return watchlists;
}
function getWatchlistById(userId) {
  return watchlists[userId] || [];
}
function saveWatchlistToUser(userId, watchlist) {
  watchlists[userId] = watchlist;
}
function saveWatchlists(newWatchlists) {
  watchlists = newWatchlists;
}

//Export functions
module.exports = {
  getUsers,
  saveUsers,
  addUser,
  getWatchlists,
  getWatchlistById,
  saveWatchlistToUser,
  saveWatchlists,
};
