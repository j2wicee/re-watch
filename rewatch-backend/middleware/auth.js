/**
 * JWT authentication middleware
 * Verifies the Authorization: Bearer <token> header and attaches user id to req.authUserId
 */
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-change-in-production";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.authUserId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware that requires auth and ensures the authenticated user matches the :userId param
 */
function requireOwnership(req, res, next) {
  const { userId } = req.params;
  if (!req.authUserId || req.authUserId !== userId) {
    return res.status(403).json({ error: "Access denied: you can only access your own watchlist" });
  }
  next();
}

module.exports = { authMiddleware, requireOwnership, JWT_SECRET };
