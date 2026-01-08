# Deployment Guide - BioAttend

## 100% FREE Deployment (No Credit Card Required)

Based on current platform policies (January 2026), here's the working free deployment strategy:

---

## Recommended Setup

| Component | Platform | Cost | Card Required |
|-----------|----------|------|---------------|
| Frontend | **Vercel** | Free | ❌ No |
| Backend | **PythonAnywhere** | Free | ❌ No |
| Database | SQLite (included) | Free | ❌ No |

**Note:** PythonAnywhere free tier works with external frontends (Vercel) - CORS is supported.

---

## Step 1: Deploy Frontend to Vercel (5 minutes)

### 1.1 Sign Up
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel (no card needed)

### 1.2 Import Project
1. Click "Add New" → "Project"
2. Find and select `biometric-attendance-system`
3. Click "Import"

### 1.3 Configure
- **Root Directory**: Click "Edit" → type `frontend` → Click outside to confirm
- **Framework Preset**: Vite (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

### 1.4 Add Environment Variable
Click "Environment Variables" and add:
| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://YOUR_USERNAME.pythonanywhere.com/api` |

*(Replace YOUR_USERNAME with your PythonAnywhere username - you'll get this in Step 2)*

### 1.5 Deploy
Click "Deploy" and wait ~2 minutes.

**Your frontend URL**: `https://bioattend-frontend.vercel.app` (or similar)

---

## Step 2: Deploy Backend to PythonAnywhere (10 minutes)

### 2.1 Sign Up
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Click "Pricing & signup"
3. Click "Create a Beginner account" (FREE - no card)
4. Fill in username, email, password

### 2.2 Upload Code

**Option A: Using Git (Recommended)**
1. Go to "Consoles" → "Bash"
2. Run these commands:
```bash
git clone https://github.com/abrahamopm/biometric-attendance-system.git
cd biometric-attendance-system
git checkout feature/ui-enhancements-deployment
```

**Option B: Upload ZIP**
1. Download your repo as ZIP from GitHub
2. Go to "Files" tab
3. Upload and extract

### 2.3 Create Virtual Environment
In Bash console:
```bash
cd ~/biometric-attendance-system/backend
mkvirtualenv --python=/usr/bin/python3.10 bioattend
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt Pillow numpy python-dotenv
```

**Note:** Skip `face_recognition` on free tier (uses fallback method). For production, upgrade to paid tier.

### 2.4 Setup Database
```bash
cd ~/biometric-attendance-system/backend
python manage.py migrate
python manage.py createsuperuser
```

### 2.5 Create Web App
1. Go to "Web" tab
2. Click "Add a new web app"
3. Click "Next" (accept free domain)
4. Select "Manual configuration"
5. Select "Python 3.10"
6. Click "Next"

### 2.6 Configure Web App

**Source code**: `/home/YOUR_USERNAME/biometric-attendance-system/backend`

**Virtualenv**: `/home/YOUR_USERNAME/.virtualenvs/bioattend`

**WSGI Configuration** - Click on the WSGI file link and replace ALL content with:
```python
import os
import sys

path = '/home/YOUR_USERNAME/biometric-attendance-system/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```
*(Replace YOUR_USERNAME with your actual username)*

### 2.7 Configure Static Files
In the "Static files" section:
| URL | Directory |
|-----|-----------|
| `/static/` | `/home/YOUR_USERNAME/biometric-attendance-system/backend/staticfiles` |

Then run in Bash:
```bash
cd ~/biometric-attendance-system/backend
python manage.py collectstatic
```

### 2.8 Set Environment Variables
Go to "Web" tab → "Environment variables" section, add:
```
SECRET_KEY=your-super-secret-random-key-here
DEBUG=False
ALLOWED_HOSTS=YOUR_USERNAME.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 2.9 Reload
Click the green "Reload" button.

**Your backend URL**: `https://YOUR_USERNAME.pythonanywhere.com`

---

## Step 3: Connect Frontend to Backend

### 3.1 Update Vercel Environment Variable
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to: `https://YOUR_USERNAME.pythonanywhere.com/api`
3. Click "Save"
4. Go to "Deployments" → Click "..." on latest → "Redeploy"

### 3.2 Update PythonAnywhere CORS
1. Go to PythonAnywhere → Web → Environment variables
2. Update `CORS_ALLOWED_ORIGINS` to your actual Vercel URL
3. Click "Reload"

---

## Your Live URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://YOUR_USERNAME.pythonanywhere.com/api`
- **Admin Panel**: `https://YOUR_USERNAME.pythonanywhere.com/admin`

---

## Free Tier Limitations

### Vercel (Hobby Plan)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ⚠️ Serverless functions limited

### PythonAnywhere (Beginner)
- ✅ 1 web app
- ✅ 512MB disk space
- ✅ SQLite database
- ⚠️ 100 CPU seconds/day
- ⚠️ No custom domain
- ⚠️ Limited outbound internet (allowlist only)

---

## Troubleshooting

### CORS Errors
Make sure `CORS_ALLOWED_ORIGINS` in PythonAnywhere exactly matches your Vercel URL (with `https://`)

### 502 Bad Gateway
- Check WSGI file for typos
- Check virtualenv path
- Check error logs in PythonAnywhere

### Static Files Not Loading
Run `python manage.py collectstatic` and reload

### Face Recognition Not Working
Free tier can't install `face_recognition` (needs dlib). The app uses a fallback hash method. For real face recognition, upgrade to paid tier ($5/month).

---

## Alternative: Railway (If You Have $5 Credit)

Railway gives $5 free credit (one-time, no card needed for trial):

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select repo, branch `feature/ui-enhancements-deployment`
5. Set Root Directory: `backend`
6. Add PostgreSQL database
7. Add environment variables
8. Deploy

Railway is easier but credit runs out. PythonAnywhere is truly free forever.

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
