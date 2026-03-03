# Re:Watch

A full-stack anime tracking web application. Discover trending anime, build and manage a personal watchlist, and track episode progress. Built with React, Express, and MongoDB.

**Live Demo:** https://re-watch-gamma.vercel.app

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, React Router 7, Create React App |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose) |
| **External API** | [Jikan API](https://jikan.moe/) (MyAnimeList) |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Deployment** | Vercel (frontend), Railway (backend), MongoDB Atlas |

---

## Architecture Overview

```
┌─────────────────┐     REST/JSON      ┌─────────────────┐     Mongoose      ┌─────────────────┐
│  React SPA      │ ◄──────────────► │  Express API    │ ◄──────────────► │  MongoDB        │
│  (Vercel)       │   JWT in header   │  (Railway)      │                  │  (Atlas)        │
└────────┬────────┘                   └────────┬────────┘                   └─────────────────┘
         │                                     │
         │ fetch()                             │ fetch()
         ▼                                     ▼
┌─────────────────┐                   ┌─────────────────┐
│  Jikan API      │                   │  (no proxy)     │
│  (anime data)   │                   │  Direct calls   │
└─────────────────┘                   └─────────────────┘
```

- **Frontend:** Single-page application with client-side routing. Fetches anime data directly from Jikan and user data from the backend API.
- **Backend:** REST API for authentication and watchlist CRUD. Stateless; no server-side sessions.
- **Database:** MongoDB stores users (email, hashed password) and embedded watchlist arrays per user.

---

## Authentication

- **Signup/Login:** Email + password. Passwords hashed with bcrypt (10 salt rounds). Strong password rules: 8+ chars, upper/lower, number, special character.
- **Sessions:** Stateless JWT (7-day expiry). Token stored in `localStorage`; sent as `Authorization: Bearer <token>` on API requests.
- **Protected routes:** Watchlist endpoints require JWT. `requireOwnership` middleware ensures users can only access their own data (403 on mismatch).

---

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/` | No | Health/hello |
| `POST` | `/signup` | No | Register user, returns JWT |
| `POST` | `/login` | No | Authenticate, returns JWT |
| `GET` | `/watchlist/:userId` | JWT + ownership | Get user's watchlist |
| `POST` | `/watchlist/:userId` | JWT + ownership | Update user's watchlist (full replace) |
| `GET` | `/admin/users` | No | List users *(dev only, disabled in production)* |
| `GET` | `/admin/stats` | No | DB stats *(dev only)* |

Watchlist items: `{ id, title, year, poster }` (anime IDs from Jikan/MyAnimeList).

---

## Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosts React build; SPA rewrites to `/index.html` |
| **Railway** | Runs Express on `PORT`; binds to `0.0.0.0` for cloud |
| **MongoDB Atlas** | Managed MongoDB; Network Access allows `0.0.0.0/0` for Railway IPs |

### Frontend (Vercel)

1. Connect repo, set **Root Directory** to `rewatch-frontend`
2. Build command: `npm run build` (default)
3. Output directory: `build`
4. Add env var: `REACT_APP_API_BASE_URL` = backend URL (e.g. `https://your-backend.up.railway.app`)

### Backend (Railway)

1. Connect repo, set root to `rewatch-backend` (or monorepo root with build config)
2. Start command: `node index.js` or `npm start`
3. Set environment variables (see below)

---

## Environment Variables

### Backend (`rewatch-backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` or `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes (prod) | Secret for signing JWTs |
| `PORT` | No | Server port (default: 5000) |
| `FRONTEND_URL` | No | CORS allowed origin (recommended in prod) |
| `NODE_ENV` | No | `production` enables prod behavior (e.g. disables admin routes) |

### Frontend (`rewatch-frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_BASE_URL` | Yes (prod) | Backend API URL; omit for `http://localhost:5000` in dev |

Generate `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas connection string)

### Setup

```bash
# Clone and install all dependencies
git clone <repo-url>
cd re-watch
npm run install:all
```

```bash
# Backend: copy env and run
cp rewatch-backend/.env.example rewatch-backend/.env
# Edit rewatch-backend/.env: set MONGODB_URI, JWT_SECRET
```

```bash
# Run both frontend and backend
npm run start:dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000  

Or run separately:

```bash
npm run start:backend   # Terminal 1
npm run start:frontend  # Terminal 2 (from root)
```

---

## Folder Structure

```
re-watch/
├── rewatch-frontend/
│   ├── public/              # Static assets, index.html
│   ├── src/
│   │   ├── components/      # AnimeCard, CardSkeleton, Navbar, SearchBar
│   │   ├── context/         # AuthContext, WatchlistContext
│   │   ├── pages/           # Landing, Browse, Watchlist, Login, Signup, AnimeDetail, etc.
│   │   └── services/        # authService, watchlistService (API calls)
│   ├── vercel.json
│   └── package.json
├── rewatch-backend/
│   ├── config/              # db.js (MongoDB connection)
│   ├── middleware/          # auth.js (JWT, ownership)
│   ├── models/              # User.js (Mongoose schema)
│   ├── routes/              # auth, watchlist, admin
│   ├── index.js
│   └── package.json
├── package.json             # Root scripts (install:all, start:dev)
├── DEPLOYMENT.md
└── README.md
```

---

## Key Features

- **Browse & Search:** Trending (all-time, current season), upcoming anime, and debounced search via Jikan API
- **Watchlist:** Add/remove anime; persisted in MongoDB per user
- **Episode Tracking:** Mark episodes as watched on the detail page; stored in `localStorage` (user + anime scoped)
- **Watch Status Badges:** "Not Started", "Watching", "Complete" derived from episode progress
- **Protected Routes:** Browse, Watchlist, and detail pages require login; redirect to `/login` when unauthenticated

---

## Performance Optimizations

- **Sequential Jikan calls** with 1s delays to respect 3 req/sec rate limit
- **Debounced search** (350ms) to reduce API calls
- **Optimistic UI** for watchlist add/remove; revert on error
- **Memoization:** `React.memo`, `useCallback`, `useMemo` on cards and contexts
- **Skeleton loading** (CardSkeleton) during data fetch
- **Image lazy loading** (`loading="lazy"`) and explicit dimensions for poster images
- **Layout containment** and `min-height: 0` fixes for Safari scroll behavior

---

## Security Considerations

- Passwords hashed with bcrypt; never stored in plain text
- JWT verification on protected routes; ownership checks prevent cross-user access
- CORS restricted to `FRONTEND_URL` in production
- Admin routes (`/admin/*`) disabled when `NODE_ENV=production`
- Input validation: email format, password strength, watchlist array shape

---

## Future Improvements

- Persist episode progress in backend (instead of `localStorage`) for cross-device sync
- Add tests (unit/integration) for auth, watchlist, and critical paths
- Pagination for trending/upcoming and search results
- Rate limiting on backend auth endpoints
- HTTPS and security headers (e.g. HSTS) in production
