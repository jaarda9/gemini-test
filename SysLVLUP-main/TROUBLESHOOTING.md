# Troubleshooting 404 Errors

## Current Issue: API endpoints returning 404

The 404 errors suggest that Vercel is not properly recognizing the API routes. Here's how to fix this:

### Step 1: Verify Deployment

1. **Check if files are deployed:**
   - Go to your Vercel dashboard
   - Click on the latest deployment
   - Check the "Functions" tab
   - You should see:
     - `/api/test`
     - `/api/debug`
     - `/api/auth/register`
     - `/api/auth/login`
     - `/api/auth/check-username/[username]`

2. **Test the debug endpoint:**
   ```
   https://your-app.vercel.app/api/debug
   ```
   This should return JSON with environment information.

### Step 2: Force Redeploy

If the API files aren't showing up:

1. **Push a small change:**
   ```bash
   echo "# Force redeploy" >> README.md
   git add README.md
   git commit -m "Force redeploy"
   git push
   ```

2. **Or trigger manual redeploy:**
   - Go to Vercel dashboard
   - Click "Redeploy" on the latest deployment

### Step 3: Check Environment Variables

1. **Verify in Vercel dashboard:**
   - Settings > Environment Variables
   - Make sure `MONGODB_URI` and `JWT_SECRET` are set

2. **Test with debug endpoint:**
   - Visit `/api/debug`
   - Check if `hasMongoUri` and `hasJwtSecret` are `true`

### Step 4: Alternative Approach

If file-based routing still doesn't work, we can use the server.js approach:

1. **Update server.js** to handle all API routes
2. **Remove the api/ folder** 
3. **Use the original server.js** with all endpoints

### Step 5: Test Individual Endpoints

After deployment, test these URLs:

1. **Debug endpoint:**
   ```
   https://your-app.vercel.app/api/debug
   ```

2. **Test endpoint:**
   ```
   https://your-app.vercel.app/api/test
   ```

3. **Username check:**
   ```
   https://your-app.vercel.app/api/auth/check-username/testuser
   ```

### Expected Results:

- ✅ `/api/debug` should return JSON with environment info
- ✅ `/api/test` should return "API is working!"
- ✅ `/api/auth/check-username/testuser` should return username availability

### If Still Getting 404:

1. **Check Vercel logs** for deployment errors
2. **Verify file structure** is correct
3. **Try the server.js approach** instead of file-based routing

Let me know what you see when you test the `/api/debug` endpoint!
