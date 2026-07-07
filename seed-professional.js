const dotenv = require('dotenv');
dotenv.config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

async function seedProfessional() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas.');
    const db = client.db('cse341');
    const collection = db.collection('user');

    // Read and parse local user.json data
    const rawData = fs.readFileSync('user.json', 'utf8');
    const users = JSON.parse(rawData);

    // Convert $oid strings back to real ObjectId objects
    const formattedUsers = users.map(user => {
      if (user._id && user._id.$oid) {
        user._id = new ObjectId(user._id.$oid);
      }
      return user;
    });

    // Clear any existing professional data in this collection
    await collection.deleteMany({});

    // Seed the formatted professional profile data
    const result = await collection.insertMany(formattedUsers);
    console.log(`${result.insertedCount} professional profile(s) seeded to database successfully.`);
  } catch (err) {
    console.error('Error seeding professional data:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

seedProfessional();
