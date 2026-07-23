const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');
const fallbackData = require('../db/fallbackData');

function getCollection() {
  try {
    return mongodb.getDb().db('cse341').collection('contacts');
  } catch (error) {
    return null;
  }
}

const getAll = async (req, res) => {
  try {
    const collection = getCollection();
    if (!collection) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(fallbackData.contacts);
    }

    const result = await collection.find();
    const contacts = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts);
  } catch (err) {
    console.error('Failed to retrieve contacts:', err);
    res.status(500).json({ message: 'Failed to retrieve contacts.' });
  }
};

const getSingle = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid contact ID format.' });
    }
    const collection = getCollection();
    if (!collection) {
      const fallbackContact = fallbackData.contacts.find((contact) => contact._id?.toString() === req.params.id);
      if (!fallbackContact) {
        return res.status(404).json({ message: 'Contact not found.' });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(fallbackContact);
    }

    const userId = new ObjectId(req.params.id);
    const result = await collection.find({ _id: userId });
    const contacts = await result.toArray();
    if (contacts.length === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts[0]);
  } catch (err) {
    console.error('Failed to retrieve contact:', err);
    res.status(500).json({ message: 'Failed to retrieve contact.' });
  }
};

const createContact = async (req, res) => {
  const contact = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    favoriteColor: req.body.favoriteColor,
    birthday: req.body.birthday,
  };

  const validationMessage = validateContact(contact);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const collection = getCollection();
    if (!collection) {
      const newContact = { ...contact, _id: `fallback-contact-${Date.now()}` };
      fallbackData.contacts.push(newContact);
      res.setHeader('Content-Type', 'application/json');
      return res.status(201).json({ message: 'Contact created successfully.', id: newContact._id });
    }

    const result = await collection.insertOne(contact);

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({ message: 'Contact created successfully.', id: result.insertedId });
  } catch (err) {
    console.error('Failed to create contact:', err);
    res.status(500).json({ message: 'Failed to create contact.' });
  }
};

const updateContact = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid contact ID format.' });
  }

  const contact = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    favoriteColor: req.body.favoriteColor,
    birthday: req.body.birthday,
  };

  const validationMessage = validateContact(contact);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const collection = getCollection();
    if (!collection) {
      const index = fallbackData.contacts.findIndex((item) => item._id?.toString() === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Contact not found.' });
      }
      fallbackData.contacts[index] = { ...fallbackData.contacts[index], ...contact };
      return res.status(204).send();
    }

    const userId = new ObjectId(req.params.id);
    const result = await collection.replaceOne({ _id: userId }, contact);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to update contact:', err);
    res.status(500).json({ message: 'Failed to update contact.' });
  }
};

const deleteContact = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid contact ID format.' });
  }

  try {
    const collection = getCollection();
    if (!collection) {
      const index = fallbackData.contacts.findIndex((item) => item._id?.toString() === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Contact not found.' });
      }
      fallbackData.contacts.splice(index, 1);
      return res.status(204).send();
    }

    const userId = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete contact:', err);
    res.status(500).json({ message: 'Failed to delete contact.' });
  }
};

function validateContact(contact) {
  if (!contact || typeof contact !== 'object') {
    return 'Contact payload must be an object.';
  }

  const requiredFields = ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'];
  for (const field of requiredFields) {
    if (!contact[field] || typeof contact[field] !== 'string' || contact[field].trim() === '') {
      return `${field} is required.`;
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(contact.email.trim())) {
    return 'email must be a valid email address.';
  }

  const birthdayPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!birthdayPattern.test(contact.birthday.trim())) {
    return 'birthday must use YYYY-MM-DD format.';
  }

  const birthdayDate = new Date(`${contact.birthday.trim()}T00:00:00Z`);
  if (Number.isNaN(birthdayDate.getTime())) {
    return 'birthday must be a valid date.';
  }

  return null;
}

module.exports = { getAll, getSingle, createContact, updateContact, deleteContact };
