# Render Deployment Configuration for Shiksha Setu

## Backend Deployment Settings

### Environment Variables (Required)
Set these in your Render dashboard:

```
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_for_jwt
DATABASE_URL=sqlite:///./shiksha_setu.db
CORS_ORIGINS=https://your-frontend-url.onrender.com
```

### Build Command
```bash
./build.sh
```

### Start Command
**IMPORTANT**: Use this exact command in your Render dashboard:
```bash
bash render_start.sh
```

Or alternatively:
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Deployment Steps

### 1. Backend Deployment on Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `shiksha-setu-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (do NOT set to backend)
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `bash render_start.sh`

3. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add each variable from the list above

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment to complete

### 2. Frontend Deployment on Render

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect the same repository

2. **Configure Static Site**
   - **Name**: `shiksha-setu-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"

### 3. Update CORS Origins

After both deployments:
1. Get your frontend URL (e.g., `https://shiksha-setu-frontend.onrender.com`)
2. Update backend environment variable:
   ```
   CORS_ORIGINS=https://shiksha-setu-frontend.onrender.com
   ```
3. Trigger a manual deploy of the backend

### 4. Database Persistence

**Important**: Render's free tier has ephemeral storage. For production:

1. **Option A: Use Render Disk (Paid)**
   - In backend service settings
   - Add a Persistent Disk
   - Mount at `/opt/render/project/src/backend`

2. **Option B: Use External Database**
   - PostgreSQL on Render
   - Update `DATABASE_URL` environment variable

## Troubleshooting

### "No such table: clusters" Error

This error occurs when the database isn't initialized. Solutions:

1. **Check Build Logs**
   - Ensure `init_db_render.py` ran successfully
   - Look for "Database initialization completed successfully"

2. **Manual Database Init**
   - In Render Shell, run:
     ```bash
     cd backend
     python init_db_render.py
     ```

3. **Redeploy**
   - Trigger a manual deploy to run the build script again

### Database File Not Persisting

If data disappears between deploys:
- Add a Persistent Disk (paid feature)
- Or migrate to PostgreSQL database

### CORS Errors

- Ensure `CORS_ORIGINS` in backend matches your frontend URL exactly
- Include the protocol (`https://`)
- No trailing slash

## Testing Deployment

1. **Backend Health Check**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status": "healthy"}`

2. **API Documentation**
   ```
   https://your-backend-url.onrender.com/docs
   ```

3. **Test Login**
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@gov.in","password":"admin123"}'
   ```

## Files Added for Render Deployment

- `build.sh` - Build script for Render
- `init_db_render.py` - Database initialization script
- `render_start.sh` - Startup script for Render
- `RENDER_DEPLOYMENT.md` - This file

## Common Deployment Issues

### ModuleNotFoundError: No module named 'models'

**Symptoms**: Backend fails to start with import errors for `models`, `core`, or `services`

**Solution**:
1. Make sure the Start Command is: `bash render_start.sh`
2. Do NOT set "Root Directory" to `backend` in Render settings
3. The start script will automatically `cd` to the backend directory

**Why this happens**: The uvicorn command needs to be run from inside the backend directory so Python can find the modules correctly.

### Database Table Not Found

**Symptoms**: Errors like "no such table: clusters" or "no such table: users"

**Solution**:
1. Make sure `build.sh` is running successfully (check build logs)
2. The `init_db_render.py` script should create all tables during build
3. Check that `DATABASE_URL` environment variable is set correctly

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify all environment variables are set
3. Ensure build script ran successfully
4. Check that database tables were created
