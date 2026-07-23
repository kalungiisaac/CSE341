const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
require('dotenv').config();

function configureAuth(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'cse341-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.CALLBACK_URL || 'http://localhost:8080/auth/github/callback',
        },
        (accessToken, refreshToken, profile, done) => done(null, profile)
      )
    );
  } else {
    console.warn('GitHub OAuth credentials are not configured. Authentication will be unavailable until GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set.');
  }
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Authentication required.' });
}

function getAuthStatus(req, res) {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
  });
}

module.exports = {
  configureAuth,
  requireAuth,
  getAuthStatus,
};
