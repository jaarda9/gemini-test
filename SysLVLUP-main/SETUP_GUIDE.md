# Authentication System Setup Guide

## Quick Setup for Vercel + MongoDB Atlas

### 1. Environment Variables Setup

#### For Local Development:
1. Copy `env.example` to `.env` in the root directory
2. Update the `.env` file with your actual values:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (at least 32 characters)

### 2. MongoDB Atlas Setup

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string from the "Connect" button
5. Replace the placeholder in your environment variables

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Collections

The system will automatically create these collections:
- `users`: User accounts and authentication data
- `userData`: Individual user game data

### 5. Testing the Authentication

1. Start the server: `node server.js`
2. Visit `http://localhost:3000/auth`
3. Try registering a new account
4. Try logging in with the created account

## Common Issues and Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your database user has correct permissions

### Issue: "Registration failed"
**Solution:**
- Check browser console for detailed error messages
- Ensure all environment variables are set correctly
- Verify MongoDB connection is working

### Issue: "Login failed"
**Solution:**
- Check if the user was created successfully
- Verify username and password are correct
- Check if JWT_SECRET is set properly

### Issue: "Authentication required" on protected pages
**Solution:**
- Make sure you're logged in
- Check if the JWT token is valid
- Clear localStorage and re-login if needed

## Security Best Practices

1. **Change the JWT_SECRET** to a secure random string
2. **Use HTTPS** in production
3. **Set up proper CORS** if needed
4. **Implement rate limiting** for production use
5. **Add email verification** for additional security

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check-username/:username` - Check username availability
- `GET /api/auth/me` - Get current user info

### Game Data
- `POST /api/sync` - Sync user game data
- `GET /api/user/:userId` - Get user data

## File Structure

```
SysLVLUP-main/
├── server.js                 # Main server with authentication
├── package.json             # Dependencies
├── env.example              # Environment variables template
├── .env                     # Your environment variables (create this)
└── SysLvLUp/Alarm/
    ├── auth.html            # Authentication page
    ├── js/auth.js           # Authentication JavaScript
    ├── css/auth.css         # Authentication styles
    └── server.js            # Local server (use main server.js instead)
```

## Deployment Notes

### Vercel
- Use the main `server.js` file as your entry point
- Set environment variables in Vercel dashboard
- Ensure MongoDB Atlas allows connections from Vercel's IP ranges

### Local Development
- Use `node server.js` to start the server
- Access the app at `http://localhost:3000`
- Authentication page at `http://localhost:3000/auth`

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server console for errors
3. Verify all environment variables are set
4. Ensure MongoDB Atlas is accessible
5. Check Vercel deployment logs if deployed
