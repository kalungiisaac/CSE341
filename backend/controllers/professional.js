const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const path = require('path');

const getData = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const profiles = await db.db('cse341').collection('user').find().toArray();
    if (profiles && profiles.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(profiles[0]);
      return;
    }
    console.warn('MongoDB collection "user" is empty. Falling back to local user.json file.');
    sendLocalData(res);
  } catch (error) {
    console.warn('Database access failed. Falling back to local user.json file.');
    sendLocalData(res);
  }
};

const getSingle = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid professional profile ID format.' });
    }

    const profileId = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('cse341').collection('user').find({ _id: profileId });
    const profiles = await result.toArray();

    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Professional profile not found.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(profiles[0]);
  } catch (error) {
    res.status(500).json({ message: error.message || 'An error occurred while retrieving the professional profile.' });
  }
};

const createProfessional = async (req, res) => {
  const profile = {
    professionalName: req.body.professionalName,
    nameLink: req.body.nameLink,
    base64Image: req.body.base64Image,
    primaryDescription: req.body.primaryDescription,
    workDescription1: req.body.workDescription1,
    workDescription2: req.body.workDescription2,
    linkTitleText: req.body.linkTitleText,
    linkedInLink: req.body.linkedInLink,
    githubLink: req.body.githubLink,
    contactText: req.body.contactText,
  };

  const validationMessage = validateProfessionalProfile(profile);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const result = await mongodb.getDb().db('cse341').collection('user').insertOne(profile);
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({ message: 'Professional profile created successfully.', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create professional profile.' });
  }
};

const updateProfessional = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid professional profile ID format.' });
  }

  const profile = {
    professionalName: req.body.professionalName,
    nameLink: req.body.nameLink,
    base64Image: req.body.base64Image,
    primaryDescription: req.body.primaryDescription,
    workDescription1: req.body.workDescription1,
    workDescription2: req.body.workDescription2,
    linkTitleText: req.body.linkTitleText,
    linkedInLink: req.body.linkedInLink,
    githubLink: req.body.githubLink,
    contactText: req.body.contactText,
  };

  const validationMessage = validateProfessionalProfile(profile);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const profileId = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('cse341').collection('user').replaceOne({ _id: profileId }, profile);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Professional profile not found.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update professional profile.' });
  }
};

const deleteProfessional = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid professional profile ID format.' });
  }

  try {
    const profileId = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('cse341').collection('user').deleteOne({ _id: profileId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Professional profile not found.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete professional profile.' });
  }
};

function validateProfessionalProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return 'Professional profile payload must be an object.';
  }

  if (!profile.professionalName || typeof profile.professionalName !== 'string' || profile.professionalName.trim() === '') {
    return 'professionalName is required.';
  }

  if (!profile.nameLink || typeof profile.nameLink !== 'object') {
    return 'nameLink is required.';
  }

  if (!profile.nameLink.firstName || typeof profile.nameLink.firstName !== 'string' || profile.nameLink.firstName.trim() === '') {
    return 'nameLink.firstName is required.';
  }

  if (!profile.nameLink.url || typeof profile.nameLink.url !== 'string' || profile.nameLink.url.trim() === '') {
    return 'nameLink.url is required.';
  }

  if (!profile.primaryDescription || typeof profile.primaryDescription !== 'string' || profile.primaryDescription.trim() === '') {
    return 'primaryDescription is required.';
  }

  if (!profile.workDescription1 || typeof profile.workDescription1 !== 'string' || profile.workDescription1.trim() === '') {
    return 'workDescription1 is required.';
  }

  if (!profile.workDescription2 || typeof profile.workDescription2 !== 'string' || profile.workDescription2.trim() === '') {
    return 'workDescription2 is required.';
  }

  if (!profile.linkTitleText || typeof profile.linkTitleText !== 'string' || profile.linkTitleText.trim() === '') {
    return 'linkTitleText is required.';
  }

  if (!profile.linkedInLink || typeof profile.linkedInLink !== 'object') {
    return 'linkedInLink is required.';
  }

  if (!profile.linkedInLink.link || typeof profile.linkedInLink.link !== 'string' || profile.linkedInLink.link.trim() === '') {
    return 'linkedInLink.link is required.';
  }

  if (!profile.linkedInLink.text || typeof profile.linkedInLink.text !== 'string' || profile.linkedInLink.text.trim() === '') {
    return 'linkedInLink.text is required.';
  }

  if (!profile.githubLink || typeof profile.githubLink !== 'object') {
    return 'githubLink is required.';
  }

  if (!profile.githubLink.link || typeof profile.githubLink.link !== 'string' || profile.githubLink.link.trim() === '') {
    return 'githubLink.link is required.';
  }

  if (!profile.githubLink.text || typeof profile.githubLink.text !== 'string' || profile.githubLink.text.trim() === '') {
    return 'githubLink.text is required.';
  }

  if (!profile.contactText || typeof profile.contactText !== 'string' || profile.contactText.trim() === '') {
    return 'contactText is required.';
  }

  return null;
}

function sendLocalData(res) {
  const filePath = path.join(__dirname, '../user.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read local user.json:', err);
      return res.status(500).json({ message: 'Error reading local user data.' });
    }
    try {
      const users = JSON.parse(data);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(users[0]);
    } catch (jsonErr) {
      console.error('Error parsing user.json:', jsonErr);
      res.status(500).json({ message: 'Error parsing local user data.' });
    }
  });
}

module.exports = { getData, getSingle, createProfessional, updateProfessional, deleteProfessional };
