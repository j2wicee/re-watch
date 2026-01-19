# Rewatch Backend

Express.js backend with MongoDB for the Rewatch application.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Connection

Create a `.env` file in the `rewatch-backend` directory with your MongoDB connection string:

```env
MONGODB_URI=your-mongodb-connection-string-here
PORT=5000
```

**Example connection strings:**

- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/rewatch`
- Local MongoDB: `mongodb://127.0.0.1:27017/rewatch`

**Note:** The `.env` file is gitignored, so your credentials won't be committed to version control.

### 3. Run the Server

```bash
node index.js
```

The server will start on `http://localhost:5000`

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (optional, defaults to local MongoDB)
- `PORT` - Server port (optional, defaults to 5000)

## API Endpoints

### Authentication

- `POST /signup` - Create a new user account
- `POST /login` - Login with email and password

### Watchlist

- `GET /watchlist/:userId` - Get user's watchlist
- `POST /watchlist/:userId` - Update user's watchlist
