# Deployment Guide

## Prerequisites

- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install): `gcloud`
- A PostgreSQL database (Supabase, Neon, or Railway)

---

## 1. Database Setup (Supabase - Recommended)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings → Database**
3. Copy the **Connection string** (URI format)
4. It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

---

## 2. Backend Deployment (Google Cloud Run)

### First-time setup:

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create poker-app-backend --name="Poker App"

# Set the project
gcloud config set project poker-app-backend

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Deploy the backend:

```bash
cd backend

# Build and deploy to Cloud Run
gcloud run deploy poker-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest"
```

### Set up secrets (first time):

```bash
# Create secrets in Secret Manager
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-jwt-secret-min-32-chars" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-refresh-secret-min-32-chars" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Run database migrations:

```bash
# After deployment, run migrations
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Note the Cloud Run URL (e.g., `https://poker-api-xxxxx-uc.a.run.app`)

---

## 3. Frontend Deployment (Firebase Hosting)

### First-time setup:

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project root
firebase init hosting

# Select:
# - Use an existing project (or create new)
# - Public directory: frontend/dist
# - Single-page app: Yes
# - Automatic builds with GitHub: No (optional)
```

### Update frontend environment:

Create `frontend/.env.production`:

```env
VITE_API_URL=https://poker-api-xxxxx-uc.a.run.app
```

### Deploy:

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Firebase (from project root)
cd ..
firebase deploy --only hosting
```

---

## 4. CORS Configuration

Update `backend/src/index.ts` to allow your Firebase domain:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-app.web.app',
  'https://your-app.firebaseapp.com',
];
```

---

## Quick Deploy Script

Create `deploy.sh` in project root:

```bash
#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "🚀 Deploying frontend to Firebase..."
firebase deploy --only hosting

echo "🚀 Deploying backend to Cloud Run..."
cd backend
gcloud run deploy poker-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
cd ..

echo "✅ Deployment complete!"
```

---

## Alternative: All-in-One with Railway

If you prefer simpler deployment, use [Railway](https://railway.app):

1. Connect your GitHub repo
2. Railway auto-detects both frontend and backend
3. Add PostgreSQL from Railway's database options
4. Set environment variables in Railway dashboard

Railway handles everything with zero configuration.

---

## Environment Variables Reference

### Backend (Cloud Run / Railway):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `NODE_ENV` | `production` |
| `PORT` | `8080` (Cloud Run default) |

### Frontend (Build time):

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## Troubleshooting

### Prisma on Cloud Run

If you get Prisma errors, ensure the Dockerfile generates the client:
```dockerfile
RUN npx prisma generate
```

### CORS errors

Add your Firebase domain to allowed origins in the backend.

### Database connection issues

- Ensure your database allows connections from Cloud Run IPs
- Supabase: Enable "Allow connections from anywhere" in database settings
