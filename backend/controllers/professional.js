const mongodb = require('../db/connect');
const fs = require('fs');
const path = require('path');

const getData = async (req, res, next) => {
  try {
    const db = mongodb.getDb();
    const result = await db.db().collection('user').find();
    result.toArray().then((lists) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists[0]); // we just need the first one (the only one)
    });
  } catch (error) {
    console.warn('Database access failed. Falling back to local user.json file.');
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
};

module.exports = { getData };
