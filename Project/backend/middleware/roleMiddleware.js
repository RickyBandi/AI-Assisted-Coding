// ─────────────────────────────────────────────────────────────────────────────
//  ROLE MIDDLEWARE  —  isAdmin
//
//  Protects admin-only routes. Must run AFTER isAuthenticated (see routes/admin.js).
//
//  Access matrix:
//    not authenticated  →  isAuthenticated redirects to /auth/login  (before this runs)
//    authenticated, role !== "admin"  →  403 Forbidden (this middleware)
//    authenticated, role === "admin"  →  next()
//
//  The role is read from the session, which is set from the database on login.
//  Changing a user's role in the DB takes effect on their next login.
// ─────────────────────────────────────────────────────────────────────────────

const isAdmin = (req, res, next) => {
  // Session is guaranteed to exist here because isAuthenticated already ran
  if (req.session.userRole === 'admin') {
    return next();
  }

  // Return 403 — do NOT redirect. Redirecting to /dashboard would reveal
  // that this route exists to non-admin users.
  return res.status(403).render('403', {
    title:       '403 — Forbidden — JobSpace',
    currentPath: req.path,
    user: {
      id:     req.session.userId,
      name:   req.session.userName,
      role:   req.session.userRole,
      avatar: req.session.userAvatar
    },
    success: [],
    error:   []
  });
};

module.exports = { isAdmin };
