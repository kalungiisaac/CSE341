const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('./db/connect');
const routes = require('./routes');

const port = process.env.PORT || 8080;
const app = express();

app
  .use(bodyParser.json())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  })
  .use(express.static(path.join(__dirname, 'frontend')))
  .use('/', routes);

// Initialize DB and start server
mongodb.initDb((err, mongodbInstance) => {
  if (err) {
    console.warn('Warning: Could not connect to MongoDB Atlas.');
    console.error(err);
  } else {
    console.log('Connected to MongoDB Atlas successfully.');
  }

  app.listen(port, () => {
    console.log(`Web Server is listening at port ${port}`);
  });
});