const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token format' });
    } else {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate the request
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { userId, localStorageData } = req.body;

    if (!userId || !localStorageData) {
      return res.status(400).json({ error: 'Missing userId or localStorageData' });
    }

    // Verify the user is syncing their own data
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Create or update the user's localStorage data
    const result = await db.collection('userData').updateOne(
      { userId: userId },
      { 
        $set: { 
          localStorage: localStorageData,
          lastUpdated: new Date()
        } 
      },
      { upsert: true }
    );

    await client.close();

    res.status(200).json({ 
      success: true, 
      message: 'LocalStorage data synced successfully',
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    });

  } catch (err) {
    console.error('Error syncing localStorage:', err);
    res.status(500).json({ error: err.message });
  }
};
