const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;
    console.log('Registration attempt:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Check if username already exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      await client.close();
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null
    };

    const result = await db.collection('users').insertOne(user);

    // Create default game data for the user
    const defaultGameData = {
      userId: result.insertedId.toString(),
      level: 1,
      hp: 100,
      mp: 100,
      stm: 100,
      exp: 0,
      fatigue: 0,
      name: username,
      ping: "60",
      guild: "Reaper",
      race: "Hunter",
      title: "None",
      region: "TN",
      location: "Hospital",
      physicalQuests: "[0/4]",
      mentalQuests: "[0/3]",
      spiritualQuests: "[0/2]",
      skillPoints: 0,
      unlockedSkills: [],
      activeQuests: [],
      Attributes: {
        STR: 10,
        VIT: 10,
        AGI: 10,
        INT: 10,
        PER: 10,
        WIS: 10,
      },
      stackedAttributes: {
        STR: 0,
        VIT: 0,
        AGI: 0,
        INT: 0,
        PER: 0,
        WIS: 0,
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    await db.collection('userData').insertOne(defaultGameData);
    await client.close();

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};
