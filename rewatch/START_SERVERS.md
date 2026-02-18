# How to Start Both Frontend and Backend

## Option 1: Run Both Together (Recommended) ✨

From the **root directory** (`rewatch`), run:

```bash
npm run start:dev
```

This will start both:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

You'll see output from both servers in the same terminal, with color-coded prefixes.

## Option 2: Run Separately (Two Terminals)

### Terminal 1 - Backend:
```bash
cd rewatch-backend
npm start
# or
node index.js
```

### Terminal 2 - Frontend:
```bash
npm start
```

## Option 3: Use Individual Scripts

From the root directory:

**Backend only:**
```bash
npm run start:backend
```

**Frontend only:**
```bash
npm run start:frontend
```

## What You Should See

When both are running:

**Backend:**
```
✅ MongoDB connected successfully
Server running on http://localhost:5000
```

**Frontend:**
```
Compiled successfully!
You can now view rewatch in the browser.
  Local:            http://localhost:3000
```

## Troubleshooting

### "Port 5000 already in use"
- Another process is using port 5000
- Close other terminals running the backend
- Or change PORT in `rewatch-backend/.env`

### "Port 3000 already in use"
- React dev server is already running
- Close the other instance
- Or React will ask to use a different port

### Backend won't start
- Check MongoDB is running/connected
- Verify `.env` file has correct `MONGO_URI`
- Check backend console for errors

## Quick Commands Reference

```bash
# Start both (recommended)
npm run start:dev

# Start backend only
npm run start:backend

# Start frontend only  
npm run start:frontend

# Or use the original React script
npm start
```

