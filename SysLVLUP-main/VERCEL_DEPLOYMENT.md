# Vercel Deployment Guide

## Quick Fix for 404 Errors

The 404 errors you're experiencing are because Vercel needs proper configuration to handle API routes.

### 1. Ensure Proper File Structure

Your project should have this structure:
```
SysLVLUP-main/
├── server.js              # Main server file (entry point)
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
├── .env                   # Environment variables (for local testing)
└── SysLvLUp/Alarm/       # Static files
    ├── auth.html
    ├── js/auth.js
    └── css/auth.css
```

### 2. Vercel Configuration

The `vercel.json` file I created will:
- Route all `/api/*` requests to your server.js
- Route all other requests to your server.js
- Use Node.js to run your server

### 3. Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

### 4. Deploy to Vercel

1. Push your changes to GitHub
2. Vercel will automatically redeploy
3. Check the deployment logs for any errors

### 5. Test the API

After deployment, test these endpoints:

1. **Test API endpoint:**
   ```
   https://your-vercel-app.vercel.app/api/test
   ```
   Should return: `{"message":"API is working!","timestamp":"..."}`

2. **Test username check:**
   ```
   https://your-vercel-app.vercel.app/api/auth/check-username/testuser
   ```
   Should return: `{"available":true,"username":"testuser"}`

### 6. Common Issues and Solutions

#### Issue: Still getting 404 errors
**Solution:**
- Make sure `vercel.json` is in the root directory
- Check that `server.js` is the main entry point
- Verify environment variables are set in Vercel dashboard

#### Issue: MongoDB connection fails
**Solution:**
- Check your MongoDB Atlas connection string
- Ensure your MongoDB Atlas allows connections from Vercel's IP ranges
- Add `0.0.0.0/0` to MongoDB Atlas IP whitelist for testing

#### Issue: Authentication endpoints not working
**Solution:**
- Check Vercel deployment logs for errors
- Verify all dependencies are in `package.json`
- Test the `/api/test` endpoint first

### 7. Debugging Steps

1. **Check Vercel logs:**
   - Go to your Vercel dashboard
   - Click on the latest deployment
   - Check the "Functions" tab for any errors

2. **Test locally first:**
   ```bash
   npm install
   node server.js
   ```
   Then visit `http://localhost:3000/api/test`

3. **Check environment variables:**
   - Verify they're set in Vercel dashboard
   - Check they're not empty or malformed

### 8. Final Verification

After deployment, you should be able to:
1. Visit your Vercel URL
2. Go to `/auth` page
3. Register a new account
4. Login with the account
5. Access protected pages

If you're still having issues, check the Vercel deployment logs and let me know what errors you see!
