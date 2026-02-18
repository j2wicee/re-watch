# Testing Guide - Frontend-Backend Integration

This guide will help you verify that your React frontend and Express/MongoDB backend are properly integrated.

## Prerequisites Checklist

- [ ] MongoDB is running (local or Atlas)
- [ ] Backend server is running on port 5000
- [ ] Frontend React app is running
- [ ] Backend `.env` file has `MONGO_URI` or `MONGODB_URI` set

## Step 1: Verify Backend is Running

### Check Backend Server
1. Open a terminal in `rewatch-backend`
2. Run: `node index.js`
3. You should see:
   ```
   ✅ MongoDB connected successfully
   Server running on http://localhost:5000
   ```

### Test Backend Endpoint (in browser or Postman)
Open: `http://localhost:5000/`

Expected response:
```json
{
  "message": "Welcome to the Rewatch Backend!"
}
```

## Step 2: Test Authentication Endpoints

### Test Signup
**Method:** POST  
**URL:** `http://localhost:5000/signup`  
**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890...",
    "email": "test@example.com"
  }
}
```

**Expected Error Responses:**
- Email already exists: `{ "error": "Email is already in use" }`
- Invalid email: `{ "error": "Invalid email format" }`
- Short password: `{ "error": "Password must be at least 6 characters" }`

### Test Login
**Method:** POST  
**URL:** `http://localhost:5000/login`  
**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890...",
    "email": "test@example.com"
  }
}
```

**Expected Error Responses:**
- Wrong password: `{ "error": "Invalid email or password" }`
- User not found: `{ "error": "Invalid email or password" }`

## Step 3: Test Watchlist Endpoints

### Get Watchlist
**Method:** GET  
**URL:** `http://localhost:5000/watchlist/{userId}`  
(Replace `{userId}` with the actual user ID from signup/login)

**Expected Success Response:**
```json
{
  "watchlist": []
}
```

### Update Watchlist
**Method:** POST  
**URL:** `http://localhost:5000/watchlist/{userId}`  
**Body (JSON):**
```json
{
  "watchlist": [
    {
      "id": 1,
      "title": "Naruto",
      "year": "2002",
      "poster": "https://example.com/poster.jpg"
    }
  ]
}
```

**Expected Success Response:**
```json
{
  "watchlist": [
    {
      "id": 1,
      "title": "Naruto",
      "year": "2002",
      "poster": "https://example.com/poster.jpg"
    }
  ]
}
```

## Step 4: Test Frontend Integration

### 1. Start Frontend
```bash
cd rewatch  # (root directory, not rewatch-backend)
npm start
```

### 2. Test Signup Flow
1. Navigate to `http://localhost:3000/signup`
2. Enter email and password
3. Click "Sign Up"
4. **Expected:** Redirects to `/app` page
5. **Check Browser Console:** Should see no errors
6. **Check Network Tab:** Should see successful POST to `/signup`

### 3. Test Login Flow
1. Log out (if logged in)
2. Navigate to `http://localhost:3000/login`
3. Enter credentials
4. Click "Log In"
5. **Expected:** Redirects to `/app` page
6. **Check Browser Console:** Should see no errors

### 4. Test Watchlist - Adding Items
1. Go to `/app` page
2. Find an anime card
3. Click "Add to Watchlist"
4. **Expected:** 
   - Button changes to "Added"
   - Watchlist count increases
   - No errors in console
5. **Check Network Tab:** Should see POST to `/watchlist/{userId}`

### 5. Test Watchlist - Viewing List
1. Navigate to `/watchlist` page
2. **Expected:** 
   - Shows all items you added
   - Loading state appears briefly
   - No errors in console
3. **Check Network Tab:** Should see GET to `/watchlist/{userId}`

### 6. Test Watchlist - Removing Items
1. On `/watchlist` page
2. Click "Remove" on an item
3. **Expected:**
   - Item disappears immediately
   - Watchlist count decreases
   - No errors in console
4. **Check Network Tab:** Should see POST to `/watchlist/{userId}` with updated list

### 7. Test Persistence
1. Add items to watchlist
2. Refresh the page (F5)
3. **Expected:**
   - Still logged in
   - Watchlist items persist
   - Data loads from backend

## Step 5: Check Browser Console

Open Browser DevTools (F12) and check:

### Console Tab
- ✅ No red errors
- ✅ Network requests show 200 status codes
- ⚠️ Yellow warnings are usually okay (React dev warnings)

### Network Tab
- ✅ Requests to `localhost:5000` succeed
- ✅ CORS headers present (if you see CORS errors, backend CORS is misconfigured)
- ✅ Response times are reasonable (< 500ms)

## Common Issues & Solutions

### Issue: "Network error" or "Failed to fetch"
**Solution:**
- Check backend is running: `http://localhost:5000`
- Check CORS is enabled in backend (should have `app.use(cors())`)
- Check firewall/antivirus isn't blocking localhost

### Issue: "CORS error" in browser console
**Solution:**
- Backend already has `app.use(cors())` - this should work
- If still failing, check backend logs for errors

### Issue: "User not found" when accessing watchlist
**Solution:**
- Make sure you're logged in
- Check `currentUser.id` matches the userId in the URL
- Verify user exists in MongoDB

### Issue: Watchlist not persisting
**Solution:**
- Check MongoDB connection in backend logs
- Verify `.env` file has correct `MONGO_URI`
- Check backend console for save errors

### Issue: Frontend can't connect to backend
**Solution:**
- Verify backend URL: Check `src/services/authService.js` and `watchlistService.js`
- Default is `http://localhost:5000`
- If backend runs on different port, set `REACT_APP_API_BASE_URL` in frontend `.env`

## Quick Test Script

You can use this in browser console to test endpoints:

```javascript
// Test signup
fetch('http://localhost:5000/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
.then(r => r.json())
.then(console.log);

// Test login (use real email/password)
fetch('http://localhost:5000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
.then(r => r.json())
.then(console.log);
```

## Success Criteria

✅ Backend starts without errors  
✅ MongoDB connects successfully  
✅ Signup creates user in database  
✅ Login authenticates correctly  
✅ Watchlist GET returns user's list  
✅ Watchlist POST saves successfully  
✅ Frontend can signup/login  
✅ Frontend can add/remove watchlist items  
✅ Data persists after page refresh  
✅ No console errors in browser  

If all these pass, your integration is working! 🎉

