const express = require('express');

const professionalController = require('../controllers/professional');

const router = express.Router();

// GET /professional - returns the default professional profile
router.get('/', professionalController.getData);

// GET /professional/:id - returns a specific professional profile
router.get('/:id', professionalController.getSingle);

// POST /professional - creates a new professional profile
router.post('/', professionalController.createProfessional);

// PUT /professional/:id - updates an existing professional profile
router.put('/:id', professionalController.updateProfessional);

// DELETE /professional/:id - deletes a professional profile
router.delete('/:id', professionalController.deleteProfessional);

module.exports = router;
