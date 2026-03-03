# Deployment Guide — Re:Watch

## Environment Variables

### Frontend (build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_BASE_URL` | Yes (production) | Backend API URL, e.g. `https://api.yoursite.com` |

### Backend (runtime)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` or `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes (production) | Secret for signing JWTs. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | No | Server port (default: 5000) |
| `FRONTEND_URL` | No | Restricts CORS to this origin (recommended in production) |

## Deploy Frontend (Vercel)

1. Connect your repo to Vercel
2. Set **Root Directory** to `rewatch-frontend`
3. Add env var: `REACT_APP_API_BASE_URL` = your backend URL
4. Deploy

## Deploy Backend

### Option A: Docker

```bash
cd rewatch-backend
docker build -t rewatch-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  -e FRONTEND_URL="https://your-app.vercel.app" \
  rewatch-backend
```

### Option B: Node

```bash
cd rewatch-backend
npm install --production
MONGODB_URI=... JWT_SECRET=... FRONTEND_URL=... node index.js
```

## Notes

- **Existing users** must log in again after JWT auth is enabled (tokens are new).
- Set `NODE_ENV=production` when running the backend in production.
