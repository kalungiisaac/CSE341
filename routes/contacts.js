const express = require('express');
const contactsController = require('../controllers/contacts');
const { requireAuth } = require('../auth');

const router = express.Router();

// GET /contacts - returns all contacts
router.get('/', contactsController.getAll);

// GET /contacts/:id - returns a single contact by id
router.get('/:id', contactsController.getSingle);

// POST /contacts - creates a new contact
router.post('/', requireAuth, contactsController.createContact);

// PUT /contacts/:id - updates an existing contact
router.put('/:id', requireAuth, contactsController.updateContact);

// DELETE /contacts/:id - removes a contact
router.delete('/:id', requireAuth, contactsController.deleteContact);

module.exports = router;
