const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'SysLvLUp', 'Alarm')));

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
