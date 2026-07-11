const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDb().db('cse341').collection('contacts').find();
    const contacts = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts);
  } catch (err) {
    console.warn('Database access failed for contacts. Falling back to local contacts.json file.');
    sendLocalContacts(res);
  }
};

const getSingle = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid contact ID format.' });
    }
    const userId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDb()
      .db('cse341')
      .collection('contacts')
      .find({ _id: userId });
    const contacts = await result.toArray();
    if (contacts.length === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts[0]);
  } catch (err) {
    console.warn('Database access failed for a single contact. Falling back to local contacts.json file.');
    sendLocalContactById(req, res);
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

  if (!contact.firstName || !contact.lastName || !contact.email || !contact.favoriteColor || !contact.birthday) {
    return res.status(400).json({ message: 'All contact fields are required.' });
  }

  try {
    const result = await mongodb
      .getDb()
      .db('cse341')
      .collection('contacts')
      .insertOne(contact);

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

  if (!contact.firstName || !contact.lastName || !contact.email || !contact.favoriteColor || !contact.birthday) {
    return res.status(400).json({ message: 'All contact fields are required.' });
  }

  try {
    const userId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDb()
      .db('cse341')
      .collection('contacts')
      .replaceOne({ _id: userId }, contact);

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
    const userId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDb()
      .db('cse341')
      .collection('contacts')
      .deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete contact:', err);
    res.status(500).json({ message: 'Failed to delete contact.' });
  }
};

function sendLocalContacts(res) {
  const filePath = path.join(__dirname, '../contacts.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read local contacts.json:', err);
      return res.status(500).json({ message: 'Error reading local contacts data.' });
    }
    try {
      const contacts = JSON.parse(data);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(contacts);
    } catch (jsonErr) {
      console.error('Error parsing contacts.json:', jsonErr);
      res.status(500).json({ message: 'Error parsing local contacts data.' });
    }
  });
}

function sendLocalContactById(req, res) {
  const filePath = path.join(__dirname, '../contacts.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read local contacts.json:', err);
      return res.status(500).json({ message: 'Error reading local contacts data.' });
    }
    try {
      const contacts = JSON.parse(data);
      const contact = contacts.find((item) => item._id.toString() === req.params.id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found.' });
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(contact);
    } catch (jsonErr) {
      console.error('Error parsing contacts.json:', jsonErr);
      res.status(500).json({ message: 'Error parsing local contacts data.' });
    }
  });
}

module.exports = { getAll, getSingle, createContact, updateContact, deleteContact };
