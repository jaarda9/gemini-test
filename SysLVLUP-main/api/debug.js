module.exports = (req, res) => {
  res.json({ 
    message: 'Debug endpoint working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    environment: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET
  });
};
