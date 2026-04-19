const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'jobspace_jwt_secret_change_in_prod';

/**
 * Resolve the current user from either:
 *   1. Authorization: Bearer <token>  (production cross-domain)
 *   2. Session cookie                 (dev / same-domain fallback)
 *
 * On success, populates req.user and req.session fields.
 * Returns the user object or null.
 */
async function resolveUser(req) {
  // ── 1. JWT from Authorization header ────────────────────────────────────────
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
      // Fetch fresh user from DB so role/avatar changes take effect immediately
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return null;

      // Hydrate session fields so any code reading req.session still works
      req.session.userId     = user._id;
      req.session.userName   = user.name;
      req.session.userRole   = user.role;
      req.session.userAvatar = user.avatar;

      return { id: user._id, name: user.name, role: user.role, avatar: user.avatar, email: user.email };
    } catch {
      return null;  // expired or tampered token
    }
  }

  // ── 2. Session cookie (dev / same-domain) ───────────────────────────────────
  if (req.session && req.session.userId) {
    return {
      id:     req.session.userId,
      name:   req.session.userName,
      role:   req.session.userRole,
      avatar: req.session.userAvatar
    };
  }

  return null;
}

// ── isAuthenticated ────────────────────────────────────────────────────────────
const isAuthenticated = async (req, res, next) => {
  const user = await resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  req.user = user;
  next();
};

// ── isAdminAuthenticated ───────────────────────────────────────────────────────
const isAdminAuthenticated = async (req, res, next) => {
  const user = await resolveUser(req);
  if (!user)               return res.status(401).json({ error: 'Not authenticated' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden — admin only' });
  req.user = user;
  next();
};

// ── isGuest ────────────────────────────────────────────────────────────────────
const isGuest = (req, res, next) => {
  // Only check session for guest guard (JWT token presence doesn't matter here)
  if (req.session && req.session.userId) {
    return res.status(400).json({ error: 'Already authenticated' });
  }
  next();
};

module.exports = { isAuthenticated, isAdminAuthenticated, isGuest };
