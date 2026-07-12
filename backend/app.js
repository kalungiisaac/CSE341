const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
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
  .use(express.static(path.join(__dirname, '../frontend')))
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use('/professional', professionalRoutes)
  .use('/contacts', contactsRoutes);

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
