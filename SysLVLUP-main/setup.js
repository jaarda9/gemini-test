const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

console.log('🔧 SysLvLUp Authentication Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Creating .env file with default values...\n');
    
    const envContent = `# MongoDB Connection String - Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT Secret Key - Change this to a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port (optional)
PORT=3000
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created!');
    console.log('⚠️  Please update the .env file with your actual MongoDB connection string and JWT secret.\n');
} else {
    console.log('✅ .env file found!\n');
}

// Load environment variables
require('dotenv').config();

// Test MongoDB connection
async function testConnection() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';
    
    console.log('🔍 Testing MongoDB connection...');
    console.log(`📡 Connection string: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();
        
        console.log('✅ MongoDB connection successful!');
        console.log(`📊 Database: ${db.databaseName}`);
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
        
        // Test users collection
        const usersCount = await db.collection('users').countDocuments();
        console.log(`👥 Users in database: ${usersCount}`);
        
        // Test userData collection
        const userDataCount = await db.collection('userData').countDocuments();
        console.log(`🎮 User data entries: ${userDataCount}`);
        
        await client.close();
        console.log('\n✅ All tests passed! Your authentication system is ready.\n');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your MONGODB_URI in .env file');
        console.log('2. Ensure MongoDB Atlas is accessible');
        console.log('3. Verify your IP is whitelisted in MongoDB Atlas');
        console.log('4. Check your database user permissions');
        console.log('5. For local development, install MongoDB locally or use MongoDB Atlas\n');
    }
}

// Check dependencies
console.log('📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'mongodb', 'express', 'dotenv'];

for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`❌ ${dep}: Missing`);
    }
}

console.log('\n🚀 Starting connection test...\n');
testConnection();
