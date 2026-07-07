const express = require('express');
const professionalController = require('../controllers/professional');

const router = express.Router();

// GET /professional - returns professional profile data
router.get('/', professionalController.getData);

module.exports = router;
