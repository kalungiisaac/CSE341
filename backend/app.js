const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('./db/connect');
const professionalRoutes = require('./routes/professional');
const contactsRoutes = require('./routes/contacts');

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
  .use('/professional', professionalRoutes)
  .use('/contacts', contactsRoutes);

// Root route handler to avoid 'Cannot GET /'
app.get('/', (req, res) => {
  res.send('Welcome to the Contacts API. Access contacts at <a href="/contacts">/contacts</a>.');
});

mongodb.initDb((err, mongodbInstance) => {
  if (err) {
    console.warn('Warning: Could not connect to MongoDB Atlas. Using local fallback (user.json).');
    console.error(err);
  } else {
    console.log('Connected to MongoDB Atlas successfully.');
  }

  // Start the server in either case so that the frontend can connect!
  app.listen(port, () => {
    console.log(`Server is running and listening on port ${port}`);
  });
});
