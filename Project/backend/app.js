require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const connectDB         = require('./config/db');
const sessionMiddleware = require('./config/session');

const app = express();

// ── Trust proxy (required for Render — sits behind a reverse proxy) ───────────
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

connectDB();

// ── CORS ──────────────────────────────────────────────────────────────────────
// CLIENT_ORIGIN         → comma-separated exact origins
//                          e.g.  https://jobspace.vercel.app
// CLIENT_ORIGIN_PATTERN → comma-separated wildcard patterns  (use * as wildcard)
//                          e.g.  *.vercel.app  will match all Vercel preview URLs
const rawOrigins   = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const exactOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

const rawPatterns   = process.env.CLIENT_ORIGIN_PATTERN || '';
const originPatterns = rawPatterns
  .split(',')
  .map(p => p.trim())
  .filter(Boolean)
  .map(p => {
    const escaped = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^,]+');
    return new RegExp(`^${escaped}$`);
  });

console.log('✅ Allowed CORS exact origins:', exactOrigins);
console.log('✅ Allowed CORS patterns     :', rawPatterns || '(none)');

function isOriginAllowed(origin) {
  if (exactOrigins.includes(origin))          return true;
  if (originPatterns.some(re => re.test(origin))) return true;
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);          // Postman / curl / server-to-server
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true    // required so cookies AND Authorization header both work
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(sessionMiddleware);

// ── Session user context (used by views / legacy session checks) ──────────────
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id:     req.session.userId,
    name:   req.session.userName,
    role:   req.session.userRole,
    avatar: req.session.userAvatar
  } : null;
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/companies',    require('./routes/companies'));
app.use('/api/documents',    require('./routes/documents'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/columns',      require('./routes/columns'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── 404 / Error ───────────────────────────────────────────────────────────────
app.use((req, res)           => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 JobSpace API running on port ${PORT}`));
