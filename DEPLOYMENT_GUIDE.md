# Deployment Guide - Environment Variables

## Problem
The deployed frontend on Vercel cannot connect to `localhost:8000` because it's trying to access your local machine, which is not accessible from the internet.

## Solution Options

### Option 1: Set Environment Variable in Vercel (Recommended for Production)

If you have a deployed Django backend:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** Your Django backend URL (e.g., `https://api.yourdomain.com/api/` or `https://your-backend.herokuapp.com/api/`)
   - **Environment:** Select Production, Preview, and Development as needed

4. **Redeploy** your Vercel project after adding the variable

**Example:**
```
VITE_API_BASE_URL=https://your-backend-domain.com/api/
```

Make sure the URL:
- Uses `https://` (not `http://`)
- Ends with `/api/`
- Is publicly accessible (not localhost)

### Option 2: Use ngrok for Local Backend Testing

If you want to test with your local Django backend:

1. Install ngrok: https://ngrok.com/
2. Start your Django server: `python manage.py runserver 8000`
3. In another terminal, run: `ngrok http 8000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Set in Vercel:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://abc123.ngrok.io/api/`

**Note:** Free ngrok URLs change each time you restart ngrok. For stable testing, consider ngrok paid plans.

### Option 3: Run Frontend Locally

If you want to use localhost for both frontend and backend:

1. Don't set `VITE_API_BASE_URL` (it will default to `http://127.0.0.1:8000/api/`)
2. Run frontend locally: `npm run dev`
3. Run Django backend: `python manage.py runserver`

## Verify Configuration

After setting the environment variable, check the deployed app:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the auto-logged message: `🔧 API Configuration: {...}`
   - Or type: `window.__API_CONFIG__`
4. Check the `API_BASE_URL` value - it should show your configured URL (not localhost)

**Example output:**
```javascript
window.__API_CONFIG__
// {
//   API_BASE_URL: "https://your-backend.com/api/",
//   VITE_API_BASE_URL: "https://your-backend.com/api/",
//   isDefault: false
// }
```

If `isDefault: true`, it means the environment variable wasn't set and it's using localhost.

## Current Configuration

The app uses `src/config/api.js` which reads:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
```

If `VITE_API_BASE_URL` is not set, it defaults to localhost (for local development only).

## Backend CORS Configuration

Make sure your Django backend allows requests from your Vercel frontend:

In `server/core/settings.py`, ensure:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local dev
    "https://iermsdeploy.vercel.app",  # Your Vercel frontend
]
```

Or set `CORS_ALLOW_ALL_ORIGINS = True` for development (not recommended for production).
