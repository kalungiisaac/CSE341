const express = require('express');
const contactsController = require('../controllers/contacts');

const router = express.Router();

// GET /contacts - returns all contacts
router.get('/', contactsController.getAll);

// GET /contacts/:id - returns a single contact by id
router.get('/:id', contactsController.getSingle);

module.exports = router;
