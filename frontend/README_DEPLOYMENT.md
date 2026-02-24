# 🚀 Deploy to Vercel

## Quick Deployment Steps:

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Grab Competitions App"
git branch -M main
git remote add origin https://github.com/yourusername/grab-competitions.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a React app
5. Click "Deploy"

### 3. Environment Variables
In Vercel dashboard, add this environment variable:
```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

## 🌐 Backend Deployment Options:

### Option 1: Render (Recommended)
1. Push backend to GitHub
2. Go to [render.com](https://render.com)
3. Create New Web Service
4. Connect your GitHub repo
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `python server.py`
7. Add environment variables from your .env file

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your backend repo
4. Add environment variables
5. Deploy

## 🔧 Configuration Files Created:
- `vercel.json` - Vercel deployment config
- `.gitignore` - Git ignore file
- `build/` - Production build folder

## 📱 After Deployment:
1. Update frontend REACT_APP_BACKEND_URL to your deployed backend URL
2. Test admin panel: `https://your-app.vercel.app/admin`
3. Password: `Olivia1josh2`

## 🎯 Live URLs:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Admin: `https://your-app.vercel.app/admin`
