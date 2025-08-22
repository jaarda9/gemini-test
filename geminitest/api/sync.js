const { MongoClient } = require('mongodb');

// Replace with your MongoDB Atlas connection string and database name
const uri = process.env.MONGODB_URI;
const dbName = 'gameData'; // Your database name

let client;
let db;

// Connect to MongoDB Atlas
async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

export default async (req, res) => {
  try {
    const database = await connectToDatabase();
    const collection = database.collection('playerProfiles');

    if (req.method === 'GET') {
      // Handle GET request to retrieve data
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const player = await collection.findOne({ userId });
      if (!player) {
        return res.status(404).json({ message: 'Device data not found' });
      }

      res.status(200).json({ localStorageData: player.localStorageData });
    } else if (req.method === 'POST') {
      // Handle POST request to save/sync data
      const { userId, localStorageData } = req.body;
      if (!userId || !localStorageData) {
        return res.status(400).json({ error: 'User ID and localStorageData are required' });
      }

      const updateResult = await collection.updateOne(
        { userId },
        { $set: { localStorageData, lastSynced: new Date() } },
        { upsert: true } // Create a new document if one doesn't exist
      );

      res.status(200).json({ success: true, message: 'Data synced successfully', updateResult });
    } else {
      // Method not allowed
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
