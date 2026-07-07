const dotenv = require('dotenv');
dotenv.config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

const contacts = [
  {
    firstName: 'Kalungi',
    lastName: 'Isaac',
    email: 'kalkatelo@gmail.com',
    favoriteColor: 'Blue',
    birthday: '1999-05-15'
  },
  {
    firstName: 'Jane',
    lastName: 'Namukasa',
    email: 'janenamukasa@gmail.com',
    favoriteColor: 'Green',
    birthday: '1998-08-22'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'johnith@outlook.com',
    favoriteColor: 'Red',
    birthday: '2000-01-10'
  }
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas.');
    const db = client.db('cse341');
    const collection = db.collection('contacts');

    // Clear existing contacts (optional — remove this line if you want to keep old data)
    await collection.deleteMany({});

    const result = await collection.insertMany(contacts);
    console.log(`${result.insertedCount} contacts inserted successfully.`);
  } catch (err) {
    console.error('Error seeding contacts:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

seed();
