// Simple test script to verify authentication system
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
  
  try {
    console.log('Testing MongoDB connection...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ MongoDB connection successful!');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log(`👥 Users in database: ${usersCount}`);
    
    // Test userData collection
    const userDataCount = await db.collection('userData').countDocuments();
    console.log(`🎮 User data entries: ${userDataCount}`);
    
    await client.close();
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your MONGODB_URI in .env file');
    console.log('2. Ensure MongoDB Atlas is accessible');
    console.log('3. Verify your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check your database user permissions');
  }
}

testConnection();
