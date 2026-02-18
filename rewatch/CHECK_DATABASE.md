# How to Check Users in MongoDB Database

There are several ways to verify that users are being stored in your MongoDB database. Here are the easiest methods:

## Method 1: Using Admin Endpoints (Easiest - No Tools Needed)

I've added admin routes to your backend for easy database inspection.

### View All Users

Open in browser or use curl:

```
http://localhost:5000/admin/users
```

**Expected Response:**

```json
{
  "count": 2,
  "users": [
    {
      "id": "694537802b5a4a4444089b6a",
      "email": "test@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "watchlistCount": 3
    },
    {
      "id": "694537802b5a4a4444089b6b",
      "email": "another@example.com",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "watchlistCount": 0
    }
  ]
}
```

### View Database Statistics

```
http://localhost:5000/admin/stats
```

**Expected Response:**

```json
{
  "totalUsers": 2,
  "usersWithWatchlist": 1,
  "totalWatchlistItems": 3
}
```

### View Specific User Details

```
http://localhost:5000/admin/users/{userId}
```

Replace `{userId}` with an actual user ID from the users list.

**Expected Response:**

```json
{
  "id": "694537802b5a4a4444089b6a",
  "email": "test@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "watchlist": [
    {
      "id": 1,
      "title": "Naruto",
      "year": "2002",
      "poster": "https://example.com/poster.jpg"
    }
  ],
  "watchlistCount": 1
}
```

## Method 2: Using MongoDB Compass (GUI Tool - Recommended)

MongoDB Compass is a visual database browser - perfect for exploring your data.

### Setup:

1. **Download MongoDB Compass:** https://www.mongodb.com/try/download/compass
2. **Install and open it**
3. **Connect using your connection string:**
   - If using MongoDB Atlas: Use your Atlas connection string from `.env`
   - If using local MongoDB: `mongodb://127.0.0.1:27017`

### Navigate to Your Data:

1. Once connected, you'll see your databases
2. Click on `rewatch` database
3. Click on `users` collection
4. You'll see all user documents with full details

**What you'll see:**

- Each user document with `_id`, `email`, `passwordHash`, `createdAt`, `watchlist`
- You can click on any document to see its full structure
- You can filter, sort, and search documents

## Method 3: Using MongoDB Shell (mongosh)

If you have MongoDB shell installed, you can query directly.

### Connect:

```bash
# For local MongoDB
mongosh mongodb://127.0.0.1:27017/rewatch

# For MongoDB Atlas (use your connection string)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/rewatch"
```

### Useful Commands:

```javascript
// Show all databases
show dbs

// Use the rewatch database
use rewatch

// Show all collections
show collections

// Count users
db.users.countDocuments()

// View all users (without passwords)
db.users.find({}, { passwordHash: 0 })

// View all users with their watchlists
db.users.find({})

// Find a specific user by email
db.users.findOne({ email: "test@example.com" })

// Count users with watchlist items
db.users.countDocuments({ watchlist: { $exists: true, $ne: [] } })

// Get user statistics
db.users.aggregate([
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      totalWatchlistItems: { $sum: { $size: { $ifNull: ["$watchlist", []] } } }
    }
  }
])
```

## Method 4: Using VS Code MongoDB Extension

If you use VS Code, there's a MongoDB extension that lets you browse databases.

### Setup:

1. Install "MongoDB for VS Code" extension
2. Click MongoDB icon in sidebar
3. Add connection (use your connection string from `.env`)
4. Browse `rewatch` → `users` collection

## Method 5: Quick Test Script

I've created a test script that also shows user data:

```bash
cd rewatch-backend
node test-endpoints.js
```

This will create a test user and show you the user ID, which you can then check in the database.

## What to Look For

When checking your database, verify:

✅ **Users Collection Exists:**

- Collection name: `users`
- Database name: `rewatch`

✅ **User Document Structure:**

```json
{
  "_id": "694537802b5a4a4444089b6a",
  "email": "user@example.com",
  "passwordHash": "$2a$10$...", // bcrypt hash, not plain text
  "createdAt": "2024-01-15T10:30:00.000Z",
  "watchlist": [
    {
      "id": 1,
      "title": "Anime Title",
      "year": "2024",
      "poster": "https://..."
    }
  ]
}
```

✅ **Security Check:**

- Passwords should be **hashed** (start with `$2a$` or `$2b$`)
- Never see plain text passwords
- Email addresses are stored in lowercase

## Troubleshooting

### "Collection not found" or "Database not found"

- Make sure you've created at least one user (signup)
- MongoDB creates collections automatically on first insert
- Check you're connected to the correct database

### "Can't connect to MongoDB"

- Verify your connection string in `.env`
- Check MongoDB is running (if local)
- Verify network access (if Atlas)

### "No users showing up"

- Try creating a new user via signup
- Check backend logs for errors
- Verify MongoDB connection in backend console

## Quick Verification Checklist

- [ ] Can access `/admin/users` endpoint
- [ ] See user count matches signups
- [ ] User emails are correct
- [ ] Passwords are hashed (not plain text)
- [ ] Watchlist items are stored correctly
- [ ] Data persists after server restart

## Security Note

⚠️ **Important:** The `/admin` routes expose user data and should be:

- Removed in production, OR
- Protected with authentication/authorization
- Only accessible in development environment

For now, they're useful for development and debugging!
