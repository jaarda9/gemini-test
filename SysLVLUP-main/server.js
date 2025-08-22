const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'SysLvLUp', 'Alarm')));

// Import sync API
const syncHandler = require('./SysLvLUp/Alarm/api/sync');

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

// Sync API routes
app.post('/api/sync', syncHandler);
app.get('/api/sync', syncHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
