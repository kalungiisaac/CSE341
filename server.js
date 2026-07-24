const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const routes = require('./routes');
const passport = require('passport');
const { configureAuth, getAuthStatus } = require('./auth');

const port = process.env.PORT || 8080;
const app = express();

app.set('trust proxy', 1);

const getCallbackUrl = (req) => {
  const configuredUrl = process.env.CALLBACK_URL;

  if (!configuredUrl) {
    return `${req.protocol}://${req.get('host')}/auth/github/callback`;
  }

  const trimmedUrl = configuredUrl.trim();

  if (trimmedUrl.endsWith('/auth/login')) {
    return trimmedUrl.replace(/\/auth\/login$/, '/auth/github/callback');
  }

  if (trimmedUrl.endsWith('/auth/github/callback')) {
    return trimmedUrl;
  }

  return `${trimmedUrl.replace(/\/$/, '')}/auth/github/callback`;
};

app
  .use(bodyParser.json())
  .use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ message: 'Request body must be valid JSON.' });
    }
    next(err);
  })
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  })
  .use(express.static(path.join(__dirname, 'frontend')))
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

configureAuth(app);

app
  .get('/auth/status', getAuthStatus)
  .get('/auth/login', (req, res, next) => {
    passport.authenticate('github', {
      scope: ['user:email'],
      callbackURL: getCallbackUrl(req),
    })(req, res, next);
  })
  .get('/auth/github/callback', (req, res, next) => {
    passport.authenticate('github', {
      failureRedirect: '/auth/failure',
      callbackURL: getCallbackUrl(req),
    })(req, res, next);
  }, (req, res) => {
    res.redirect('/');
  })
  .get('/auth/failure', (req, res) => {
    res.status(401).json({ message: 'Authentication failed.' });
  })
  .get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })
  .use('/', routes);

// Initialize DB and start server
mongodb.initDb((err) => {
  if (err) {
    console.warn('Warning: Could not connect to MongoDB Atlas. Continuing with fallback data.');
    console.error(err);
  } else {
    console.log('Connected to MongoDB Atlas successfully.');
  }

  const server = app.listen(port, () => {
    console.log(`Web Server is listening at port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please stop the existing process or set PORT to a different value.`);
      process.exit(1);
    }
    throw error;
  });
});
