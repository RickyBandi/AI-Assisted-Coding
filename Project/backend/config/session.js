const session    = require('express-session');
const MongoStore = require('connect-mongo');

const isProd = process.env.NODE_ENV === 'production';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'jobspace_secret_key_change_this_in_production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600   // only update session once per day unless data changed
  }),
  cookie: {
    maxAge:   1000 * 60 * 60 * 24 * 7,  // 7 days
    httpOnly: true,
    // In production (Render → Vercel cross-domain):
    //   secure: true  → only sent over HTTPS
    //   sameSite: 'none' → required for cross-site cookies
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax'
  }
};

module.exports = session(sessionConfig);
