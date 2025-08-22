const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'SysLvLUp', 'Alarm')));

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    console.log('Database name:', db.databaseName);
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please check your MONGODB_URI environment variable');
    console.log('For local development, you can use: mongodb://localhost:27017/gamedata');
  }
}

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

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'SysLvLUp', 'Alarm', 'index.html'));
});

app.get('/skill-tree', (req, res) => {
  res.sendFile(path.join(__dirname, 'SysLvLUp', 'Alarm', 'skill-tree.html'));
});

app.get('/random-quest', (req, res) => {
  res.sendFile(path.join(__dirname, 'SysLvLUp', 'Alarm', 'random-quest.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'SysLvLUp', 'Alarm', 'auth.html'));
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Debug endpoint working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
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

    // Check if database is connected
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

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

    console.log('User registered successfully:', { username, userId: result.insertedId.toString() });

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', { username: req.body.username });
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if database is connected
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Find user
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
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

    console.log('User logged in successfully:', { username, userId: user._id.toString() });

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
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/auth/check-username/:username', async (req, res) => {
  console.log('Username check:', req.params.username);
  try {
    const { username } = req.params;
    
    const existingUser = await db.collection('users').findOne({ username });
    
    res.status(200).json({ 
      available: !existingUser,
      username 
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Username check failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Sync localStorage data endpoint
app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    const { userId, localStorageData } = req.body;

    if (!userId || !localStorageData) {
      return res.status(400).json({ error: 'Missing userId or localStorageData' });
    }

    // Verify the user is syncing their own data
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

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
});

// Get user data endpoint
app.get('/api/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await db.collection('userData').findOne({ userId });
    
    if (!userData) {
      return res.status(404).json({ error: 'User data not found' });
    }

    res.status(200).json(userData);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
