const { MongoClient } = require('mongodb');
require('dotenv').config();

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;
    console.log('Username check:', username);
    
    if (!username) {
      return res.status(400).json({ error: 'Username parameter required' });
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    const existingUser = await db.collection('users').findOne({ username });
    await client.close();
    
    res.status(200).json({ 
      available: !existingUser,
      username 
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Username check failed' });
  }
};
