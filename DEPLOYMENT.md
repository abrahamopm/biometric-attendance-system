# Deployment Guide - BioAttend

This guide covers deploying the BioAttend biometric attendance system to Render.

## Deploy Everything to Render (Recommended)

Render can host both frontend and backend with a free PostgreSQL database.

---

## Option 1: One-Click Deploy with Blueprint

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create:
   - Backend API (Python/Django)
   - Frontend (Static Site)
   - PostgreSQL Database

6. After deployment, update environment variables:
   - In **bioattend-api**: Set `CORS_ALLOWED_ORIGINS` to your frontend URL
   - In **bioattend-frontend**: Set `VITE_API_URL` to your backend URL + `/api`

---

## Option 2: Manual Deployment

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Name: `bioattend-db`
4. Plan: Free
5. Click "Create Database"
6. Copy the **Internal Database URL**

---

### Step 2: Deploy Backend

1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `bioattend-api` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| Start Command | `gunicorn backend.wsgi:application` |

4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | (click Generate) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `DATABASE_URL` | (paste from Step 1) |
| `PYTHON_VERSION` | `3.11.4` |

5. Click "Create Web Service"
6. Wait for deployment (5-10 mins first time)
7. Copy your backend URL: `https://bioattend-api.onrender.com`

---

### Step 3: Deploy Frontend

1. Click "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `bioattend-frontend` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bioattend-api.onrender.com/api` |

5. Click "Create Static Site"
6. Copy your frontend URL: `https://bioattend-frontend.onrender.com`

---

### Step 4: Update CORS

Go back to your backend service and add:

| Key | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://bioattend-frontend.onrender.com` |

Render will auto-redeploy.

---

## Your URLs

After deployment:
- **Frontend**: `https://bioattend-frontend.onrender.com`
- **Backend API**: `https://bioattend-api.onrender.com/api`
- **Admin Panel**: `https://bioattend-api.onrender.com/admin`

---

## Create Admin User

To access Django admin, run in Render Shell:

```bash
python manage.py createsuperuser
```

---

## Environment Variables Reference

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret | Auto-generate |
| `DEBUG` | Debug mode | `False` |
| `DATABASE_URL` | PostgreSQL URL | From Render DB |
| `ALLOWED_HOSTS` | Allowed domains | `.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | `https://bioattend-frontend.onrender.com` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://bioattend-api.onrender.com/api` |

---

## Troubleshooting

### Cold Starts (Free Tier)
Free tier services sleep after 15 mins of inactivity. First request may take 30-60 seconds.

### Face Recognition
If `face_recognition` fails to install, the app uses a fallback method. For production, consider upgrading to a paid plan with more build resources.

### Build Fails
Check Render logs. Common issues:
- Missing `PYTHON_VERSION` env var
- Database not connected

### CORS Errors
Ensure `CORS_ALLOWED_ORIGINS` exactly matches your frontend URL (with `https://`)

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

---

## Cost

Render Free Tier includes:
- 750 hours/month for web services
- 1 free PostgreSQL database (90 days, then $7/month)
- Static sites are always free

For production, consider Starter plan ($7/month) to avoid cold starts.
