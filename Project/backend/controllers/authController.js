const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const JWT_SECRET     = process.env.JWT_SECRET || 'jobspace_jwt_secret_change_in_prod';
const JWT_EXPIRES_IN = '7d';

/** Sign a token for a user */
function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Please fill in all fields.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });

    user.lastLogin = new Date();
    await user.save();

    // ── Session (works in dev / same-domain) ──────────────────────────────────
    req.session.userId     = user._id;
    req.session.userName   = user.name;
    req.session.userRole   = user.role;
    req.session.userAvatar = user.avatar;

    // ── JWT (required for cross-domain production: Vercel ↔ Render) ──────────
    const token = signToken(user);

    return res.json({
      ok: true,
      token,                         // <── frontend stores this in localStorage
      user: { id: user._id, name: user.name, role: user.role, avatar: user.avatar, email: user.email }
    });
  } catch (err) {
    console.error('[authController] postLogin:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Please fill in all fields.' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing)
      return res.status(409).json({ error: 'Email already registered.' });

    const user = await User.create({
      name:  name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role:  'user'
    });

    req.session.userId     = user._id;
    req.session.userName   = user.name;
    req.session.userRole   = user.role;
    req.session.userAvatar = user.avatar;

    const token = signToken(user);

    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, role: user.role, avatar: user.avatar, email: user.email }
    });
  } catch (err) {
    console.error('[authController] postRegister:', err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
  // Note: frontend will also remove the JWT from localStorage (handled in AuthContext)
};

exports.getMe = (req, res) => {
  // req.session is hydrated by authMiddleware (works for both JWT and session-cookie auth)
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({
    user: {
      id:     req.session.userId,
      name:   req.session.userName,
      role:   req.session.userRole,
      avatar: req.session.userAvatar
    }
  });
};
