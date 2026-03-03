# Re:Watch

Anime tracking app — discover, watchlist, and track your favorite anime.

## Project Structure

```
re-watch/
├── rewatch-frontend/   # React app (Create React App)
├── rewatch-backend/    # Express + MongoDB API
├── package.json        # Root scripts (start both, install all)
└── README.md
```

## Quick Start

1. **Install dependencies**
   ```bash
   npm run install:all
   ```
   Or install separately:
   ```bash
   cd rewatch-frontend && npm install
   cd ../rewatch-backend && npm install
   ```

2. **Configure backend**  
   Copy `rewatch-backend/.env.example` to `rewatch-backend/.env` and add your MongoDB URI and JWT_SECRET.

3. **Run development**
   ```bash
   npm run start:dev
   ```
   Or run separately:
   ```bash
   # Terminal 1 - backend
   npm run start:backend

   # Terminal 2 - frontend
   npm run start:frontend
   ```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables and deploy steps.
