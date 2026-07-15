const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const routes = require('./routes');

const port = process.env.PORT || 8080;
const app = express();

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
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
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
