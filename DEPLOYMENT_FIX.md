# Quick Fix for Render Deployment

## The Problem
You're getting `ModuleNotFoundError: No module named 'models'` when deploying to Render.

## The Solution
Update your Render service configuration:

### Step 1: Update Start Command
In your Render dashboard:
1. Go to your service settings
2. Find the "Start Command" field
3. Change it to: `bash render_start.sh`

### Step 2: Verify Root Directory
1. Make sure "Root Directory" is **empty** or set to `/`
2. Do NOT set it to `backend`

### Step 3: Redeploy
Click "Manual Deploy" → "Clear build cache & deploy"

## Why This Works
The `render_start.sh` script:
- Changes directory to `backend` first
- Then runs uvicorn from inside the backend directory
- This ensures Python can find all the modules (models, core, services)

## Alternative Start Command
If you prefer not to use the script, you can use:
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

This does the same thing inline.

## Still Having Issues?
Check the full deployment guide in `RENDER_DEPLOYMENT.md` for more details.
