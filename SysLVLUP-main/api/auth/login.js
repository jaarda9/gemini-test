const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Find user
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      await client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    await client.close();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
