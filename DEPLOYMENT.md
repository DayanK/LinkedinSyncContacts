# 🚀 Deployment Guide - LinkedIn Contact Sync

This guide will walk you through deploying your application to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Extension Publishing](#extension-publishing)
5. [LinkedIn OAuth Configuration](#linkedin-oauth-configuration)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, make sure you have:

- [x] GitHub account with your code pushed
- [x] LinkedIn Developer App created
- [x] Domain name (optional, but recommended)

---

## 🖥️ Backend Deployment (Railway)

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `LinkedinSyncContacts`

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a PostgreSQL database
3. Copy the `DATABASE_URL` from the PostgreSQL service

### Step 3: Configure Environment Variables

In Railway, go to your backend service → Variables → Add:

```bash
DATABASE_URL=<auto-provided-by-railway>
JWT_SECRET=<generate-a-secure-random-string>
PORT=4001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-secret>
LINKEDIN_CALLBACK_URL=https://your-backend.up.railway.app/api/auth/linkedin/callback
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Update Backend for Production

Add this to `backend/package.json`:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc && npx prisma generate",
    "deploy": "npx prisma migrate deploy && npm start"
  }
}
```

Create `Procfile` in backend folder:
```
web: npm run deploy
```

### Step 5: Deploy

1. Commit and push changes
2. Railway will auto-deploy
3. Get your backend URL: `https://your-app.up.railway.app`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your `LinkedinSyncContacts` repo

### Step 2: Configure Build Settings

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend.up.railway.app/api
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Get your frontend URL: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

Update `FRONTEND_URL` in Railway to match your Vercel URL.

---

## 🔧 Extension Publishing

### Chrome Web Store

#### Step 1: Prepare Extension

Update `extension/popup/popup.js` and `extension/popup/popup-auth.js`:

```javascript
const API_URL = 'https://your-backend.up.railway.app/api';
```

Update `extension/popup/popup.html` view button:

```javascript
viewBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://your-app.vercel.app' });
});
```

#### Step 2: Create ZIP

```bash
cd extension
zip -r linkedin-sync-extension.zip . -x "*.DS_Store" -x "dashboard/*"
```

#### Step 3: Publish to Chrome Web Store

1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee
3. Click "New Item" → Upload `linkedin-sync-extension.zip`
4. Fill in:
   - **Name:** LinkedIn Contact Sync
   - **Description:** Extract and sync your LinkedIn contacts with ease
   - **Category:** Productivity
   - **Screenshots:** Take 3-5 screenshots (1280x800 or 640x400)
   - **Icon:** Use your 128x128 icon
   - **Privacy Policy:** Required (see template below)

5. Submit for review (1-3 days)

#### Step 4: Firefox Add-ons

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Upload the same ZIP (manifest.json is compatible)
3. Submit (review takes a few hours)

### Privacy Policy Template

Create a simple privacy policy page:

```markdown
# Privacy Policy - LinkedIn Contact Sync

Last updated: [DATE]

## Data Collection
- We only store contacts you explicitly extract from LinkedIn
- We use LinkedIn OAuth for authentication
- No passwords are stored

## Data Usage
- Contact data is stored on our servers for synchronization
- We do not sell or share your data with third parties
- You can delete your data at any time

## Security
- All data is encrypted in transit (HTTPS)
- Passwords are hashed with bcrypt
- JWT tokens expire after 7 days

## Contact
For questions: your-email@example.com
```

Host this on your Vercel app at `/privacy` and link it in the extension listing.

---

## 🔗 LinkedIn OAuth Configuration

### Update LinkedIn Developer App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to "Auth" tab
4. Update **Authorized redirect URLs:**
   ```
   https://your-backend.up.railway.app/api/auth/linkedin/callback
   ```

5. Add Products:
   - Sign In with LinkedIn using OpenID Connect
   - Share on LinkedIn

6. Save changes

---

## ✅ Post-Deployment Checklist

### Backend Health Check

Test your API:
```bash
curl https://your-backend.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Database Migration

Run Prisma migrations:
```bash
# In Railway dashboard
npx prisma migrate deploy
```

### Test OAuth Flow

1. Go to `https://your-app.vercel.app/login`
2. Click "Sign in with LinkedIn"
3. Authorize the app
4. Should redirect back successfully

### Test Extension

1. Install extension from Chrome Web Store (or load unpacked for testing)
2. Click extension icon
3. Sign in with LinkedIn
4. Go to LinkedIn page with contacts
5. Extract contacts
6. Check they appear in dashboard

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Push to main branch** → Auto-deploy backend (Railway)
- **Push to main branch** → Auto-deploy frontend (Vercel)

No manual intervention needed! 🎉

---

## 🐛 Troubleshooting

### Backend 500 Error

Check Railway logs:
```bash
# In Railway dashboard → Deployments → View logs
```

### CORS Issues

Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly (no trailing slash).

### LinkedIn OAuth Fails

1. Check callback URL in LinkedIn Developer Console
2. Verify `LINKEDIN_CALLBACK_URL` in Railway environment variables
3. Make sure LinkedIn app has OpenID Connect product enabled

### Database Connection Issues

Railway PostgreSQL takes a minute to provision. Wait and retry.

---

## 💰 Costs

### Free Tier (Testing)

- **Railway:** $5/month free credit (enough for small apps)
- **Vercel:** Free for personal projects
- **Chrome Web Store:** $5 one-time fee
- **Firefox Add-ons:** Free

**Total:** ~$10 one-time + ~$0-5/month

### Production (High Traffic)

- **Railway:** ~$10-20/month (500MB RAM, PostgreSQL)
- **Vercel:** Free (unless >100GB bandwidth)
- **Domain (optional):** ~$12/year

**Total:** ~$15-25/month

---

## 🎯 Next Steps

After deployment:

1. **Monitor usage** - Set up error tracking (Sentry)
2. **Add analytics** - Track user engagement
3. **Collect feedback** - Add support email
4. **Marketing** - Share on LinkedIn, Twitter, Reddit
5. **Scale** - Upgrade plans as needed

---

## 🆘 Support

- **GitHub Issues:** https://github.com/DayanK/LinkedinSyncContacts/issues
- **Email:** your-email@example.com

---

Made with ❤️ by Maxim Kemajou
