const express = require('express');
const router = express.Router();

const professionalRoutes = require('./professional');
const contactsRoutes = require('./contacts');

// Route endpoints
router.use('/professional', professionalRoutes);
router.use('/contacts', contactsRoutes);

// Fallback/original course route
router.get('/Kalungi', (req, res) => {
  res.send('Klaungi Isaac');
});

module.exports = router;
