# Authentication System Setup Guide

## Overview
Your solo leveling system now includes a complete user authentication system that allows multiple users to have their own separate game data.

## Features
- ✅ User registration and login
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Individual user data isolation
- ✅ Session management
- ✅ Username availability checking
- ✅ Password strength validation
- ✅ Automatic logout on token expiration

## Setup Instructions

### 1. Install Dependencies
```bash
npm install bcryptjs jsonwebtoken
```

### 2. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT Secret Key (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port (optional)
PORT=3000
```

### 3. Vercel Deployment
For Vercel deployment, add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing

### 4. Database Collections
The system will automatically create these collections in your MongoDB database:
- `users`: Stores user account information
- `userData`: Stores individual user game data

## How It Works

### User Registration
1. Users visit `/auth.html`
2. Fill out registration form with username, email, and password
3. System checks username availability in real-time
4. Password is hashed using bcrypt
5. User account and default game data are created
6. User is redirected to login

### User Login
1. Users enter username and password
2. System verifies credentials against database
3. JWT token is generated and stored in localStorage
4. User is redirected to status page
5. All subsequent requests include the JWT token

### Data Isolation
- Each user has their own `userId` in the database
- Game data is stored separately for each user
- Users can only access their own data
- Authentication middleware protects all API endpoints

### Session Management
- JWT tokens expire after 7 days
- Automatic logout when token expires
- Secure token storage in localStorage
- Server-side token validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check-username/:username` - Check username availability
- `GET /api/auth/me` - Get current user info

### Game Data
- `POST /api/sync` - Sync user game data (requires authentication)
- `GET /api/user/:userId` - Get user data (requires authentication)

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Password strength validation on registration
- Minimum 6 character requirement

### Token Security
- JWT tokens with 7-day expiration
- Secure token storage
- Server-side token validation
- Automatic token refresh handling

### Data Protection
- User data isolation
- Authentication middleware on all protected routes
- User can only access their own data
- Input validation and sanitization

## User Experience

### Registration Flow
1. User clicks "Register here" on auth page
2. Fills out form with real-time validation
3. Username availability is checked automatically
4. Password strength is displayed
5. Account is created with default game data
6. Redirected to login

### Login Flow
1. User enters credentials
2. System validates and creates session
3. User is redirected to status page
4. Welcome message shows username
5. Logout button available in header

### Game Integration
- All existing game features work with authentication
- User data is automatically synced to their account
- Random quests and skill tree work per user
- Progress is saved individually

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - User needs to log in first
   - Check if JWT token is valid
   - Clear localStorage and re-login

2. **"Username already exists"**
   - Choose a different username
   - System checks availability in real-time

3. **"Invalid credentials"**
   - Check username and password
   - Ensure account was created successfully

4. **Token expiration**
   - User will be automatically redirected to login
   - Session is cleared and user must re-authenticate

### Database Issues
- Ensure MongoDB Atlas connection string is correct
- Check if collections are created automatically
- Verify user permissions in MongoDB Atlas

## Customization

### Styling
- Authentication pages use the same theme as your game
- Colors and fonts match the status page
- Responsive design for mobile devices

### Security
- Change JWT_SECRET to a secure random string
- Consider implementing rate limiting
- Add email verification if needed
- Implement password reset functionality

### Features
- Add user profiles
- Implement friend system
- Add leaderboards
- Create guild system

## Support
If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas is accessible
4. Check Vercel deployment logs
