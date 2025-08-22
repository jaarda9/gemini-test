const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Username check:', req.query.username);
  
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
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
