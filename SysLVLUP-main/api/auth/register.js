const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Registration attempt:', { username: req.body.username, email: req.body.email });
  
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
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
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      } else {
        return res.status(400).json({ error: 'Email already exists' });
      }
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

    console.log('User registered successfully:', { username, userId: result.insertedId.toString() });

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};
