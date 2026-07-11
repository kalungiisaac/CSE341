const express = require('express');
const contactsController = require('../controllers/contacts');

const router = express.Router();

// GET /contacts - returns all contacts
router.get('/', contactsController.getAll);

// GET /contacts/:id - returns a single contact by id
router.get('/:id', contactsController.getSingle);

// POST /contacts - creates a new contact
router.post('/', contactsController.createContact);

// PUT /contacts/:id - updates an existing contact
router.put('/:id', contactsController.updateContact);

// DELETE /contacts/:id - removes a contact
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
