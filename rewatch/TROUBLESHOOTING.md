# Troubleshooting Network Errors

## Issue: "Network error" when trying to login or signup

### Most Common Cause: Backend Server Not Running

The frontend tries to connect to `http://localhost:5000` but the backend isn't running.

### Solution:

1. **Open a terminal in the `rewatch-backend` directory**
2. **Start the backend server:**
   ```bash
   cd rewatch-backend
   node index.js
   ```

3. **You should see:**
   ```
   ✅ MongoDB connected successfully
   Server running on http://localhost:5000
   ```

4. **Keep this terminal open** - the server needs to keep running

5. **In a separate terminal, start the frontend:**
   ```bash
   npm start
   ```

### Verify Backend is Running:

Open in browser: `http://localhost:5000`

You should see:
```json
{
  "message": "Welcome to the Rewatch Backend!"
}
```

### Other Possible Issues:

1. **Wrong Port:**
   - Backend should be on port 5000
   - Check `rewatch-backend/.env` for `PORT=5000`
   - Or check console output when starting backend

2. **MongoDB Not Connected:**
   - Backend won't start if MongoDB connection fails
   - Check MongoDB is running (local or Atlas)
   - Verify `.env` has correct `MONGO_URI` or `MONGODB_URI`

3. **Firewall/Antivirus:**
   - May be blocking localhost connections
   - Try temporarily disabling to test

4. **CORS Errors:**
   - Backend has `app.use(cors())` which should handle this
   - If still seeing CORS errors, check backend console

### Quick Test:

Run this in browser console (F12):
```javascript
fetch('http://localhost:5000/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If this fails, the backend isn't running or accessible.


