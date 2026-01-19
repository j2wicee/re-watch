# Quick Verification Checklist

Use this checklist to quickly verify everything is working:

## ✅ Backend Setup

- [ ] Backend server running (`node index.js` in `rewatch-backend`)
- [ ] MongoDB connected (see "✅ MongoDB connected successfully" in console)
- [ ] Backend responds at `http://localhost:5000`
- [ ] Test script passes: `node rewatch-backend/test-endpoints.js`

## ✅ Frontend Setup

- [ ] Frontend running (`npm start` in root directory)
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] No console errors in browser DevTools

## ✅ Integration Tests

### Authentication
- [ ] Can sign up a new account
- [ ] Can log in with credentials
- [ ] User persists after page refresh
- [ ] Can log out

### Watchlist
- [ ] Can add anime to watchlist from `/app` page
- [ ] Watchlist count updates immediately
- [ ] Can view watchlist on `/watchlist` page
- [ ] Can remove items from watchlist
- [ ] Watchlist persists after page refresh
- [ ] Duplicate items are prevented

## 🔍 Debugging Steps

If something doesn't work:

1. **Check Backend Console:**
   - Look for error messages
   - Verify MongoDB connection
   - Check request logs

2. **Check Browser Console (F12):**
   - Look for red errors
   - Check Network tab for failed requests
   - Verify API calls are going to correct URL

3. **Check Network Tab:**
   - Requests should go to `http://localhost:5000`
   - Status codes should be 200 (success) or 400/401 (expected errors)
   - Check CORS headers if seeing CORS errors

4. **Verify Environment:**
   - Backend `.env` has `MONGO_URI` set
   - Frontend can reach `http://localhost:5000`
   - Both servers are running

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Network error" | Backend not running or wrong URL |
| "CORS error" | Backend CORS middleware should handle this automatically |
| "User not found" | Make sure you're logged in and userId is correct |
| Watchlist not saving | Check MongoDB connection in backend logs |
| Can't connect to backend | Verify backend is on port 5000 and firewall allows it |

## 📝 Test Commands

```bash
# Test backend endpoints
cd rewatch-backend
node test-endpoints.js

# Start backend
cd rewatch-backend
node index.js

# Start frontend (in separate terminal)
npm start
```

