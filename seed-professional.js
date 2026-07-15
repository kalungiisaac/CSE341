const dotenv = require('dotenv');
dotenv.config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const DB_NAME = 'cse341';
const COLLECTION_NAME = 'user';
const USERS_FILE = path.join(__dirname, 'user.json');
const FRONTEND_IMAGES_DIR = path.join(__dirname, 'frontend', 'images');

async function seedProfessional() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas.');
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Read profile data from user.json. Image fields should reference files in frontend/images.
    const rawData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(rawData);

    const formattedUsers = users.map((user) => {
      if (user._id && user._id.$oid) {
        user._id = new ObjectId(user._id.$oid);
      }

      validateProfileImage(user);
      return user;
    });

    await collection.deleteMany({});

    const result = await collection.insertMany(formattedUsers);
    console.log(`${result.insertedCount} professional profile(s) seeded to database successfully.`);
  } catch (err) {
    console.error('Error seeding professional data:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

function validateProfileImage(user) {
  const imageValue = user.base64Image;
  if (!imageValue || typeof imageValue !== 'string') {
    throw new Error(`${user.professionalName || 'A profile'} is missing base64Image.`);
  }

  const normalizedImage = imageValue.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalizedImage.startsWith('images/')) {
    throw new Error(`${user.professionalName || 'A profile'} must use an images/... path for base64Image.`);
  }

  const imageFileName = normalizedImage.replace('images/', '');
  const imagePath = path.join(FRONTEND_IMAGES_DIR, imageFileName);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found for ${user.professionalName || 'profile'}: ${imagePath}`);
  }

  user.base64Image = normalizedImage;
}

seedProfessional();
