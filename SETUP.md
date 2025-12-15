# 🚀 LinkedIn Contact Sync - Complete Setup Guide

## ✅ What's Been Built

### Backend (Node.js + Express + SQLite)
- ✅ User authentication (JWT)
- ✅ LinkedIn OAuth integration
- ✅ Contact sync API
- ✅ SQLite database with Prisma ORM
- ✅ CORS configured for extension & frontend

### Frontend (React + TypeScript + Tailwind)
- ✅ Login/Register pages
- ✅ LinkedIn OAuth button
- ✅ Contact management dashboard
- ✅ Search & filter
- ✅ CSV export
- ✅ Protected routes

### Extension (Chrome/Firefox)
- ✅ LinkedIn scraper
- ✅ Authentication with backend
- ✅ Auto-sync to backend
- ✅ Beautiful popup UI

---

## 🎯 Quick Start

### 1️⃣ Start Backend

```bash
cd backend
npm run dev
```

✅ Backend running on **http://localhost:3001**

### 2️⃣ Start Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend running on **http://localhost:5173**

### 3️⃣ Load Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

✅ Extension installed!

---

## 📝 First Time Usage

### Step 1: Create Account

**Option A: Email/Password**
1. Go to http://localhost:5173/register
2. Fill in your details
3. Click "Sign up"

**Option B: LinkedIn OAuth** (Requires setup)
1. Go to http://localhost:5173/login
2. Click "Sign in with LinkedIn"
3. Authorize the app

### Step 2: Sign in to Extension

1. Click the extension icon
2. Enter your email/password
3. Click "Sign In"

### Step 3: Extract Contacts

1. Go to [LinkedIn Connections](https://www.linkedin.com/mynetwork/invite-connect/connections/)
2. Scroll to load contacts
3. Click extension icon
4. Click "📥 Extract contacts"
5. ✅ Contacts synced to backend!

### Step 4: View Your Contacts

- Click "📊 View my contacts" in extension
- OR go to http://localhost:5173
- Search, export CSV, manage contacts!

---

## 🔧 LinkedIn OAuth Setup (Optional)

To enable "Sign in with LinkedIn":

1. Go to https://www.linkedin.com/developers/apps
2. Create new app
3. Request access to "Sign In with LinkedIn using OpenID Connect"
4. Get Client ID & Secret
5. Update `backend/.env`:
   ```env
   LINKEDIN_CLIENT_ID="your-client-id"
   LINKEDIN_CLIENT_SECRET="your-client-secret"
   LINKEDIN_CALLBACK_URL="http://localhost:3001/api/auth/linkedin/callback"
   ```
6. Add callback URL in LinkedIn app settings:
   ```
   http://localhost:3001/api/auth/linkedin/callback
   ```
7. Restart backend

---

## 📊 Database Management

### View Database
```bash
cd backend
npm run prisma:studio
```

Opens Prisma Studio on http://localhost:5555

### Reset Database
```bash
cd backend
rm -rf prisma/dev.db prisma/migrations
npm run prisma:migrate
```

---

## 🔄 Migration to Production DB

### PostgreSQL (Recommended)

1. Create PostgreSQL database (Supabase/Neon/Railway)

2. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from sqlite
     url      = env("DATABASE_URL")
   }
   ```

4. Migrate:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

### MongoDB

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mongodb"
     url      = env("DATABASE_URL")
   }
   ```

2. Adjust models for MongoDB (add @map, @db.ObjectId, etc.)

3. Migrate

---

## 🌐 Deploy to Production

### Backend (Railway/Render/Fly.io)

1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy!

### Frontend (Vercel/Netlify)

1. Update API URL in `.env`:
   ```env
   VITE_API_URL="https://your-backend.com/api"
   ```
2. Build: `npm run build`
3. Deploy `dist/` folder

### Extension (Chrome Web Store)

1. Zip the `extension/` folder
2. Update API URLs to production
3. Submit to Chrome Web Store
4. Wait for approval (~3-5 days)

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is free: `lsof -ti:3001 | xargs kill -9`
- Delete node_modules: `rm -rf node_modules && npm install`

### Extension not extracting
- Check console (F12) on LinkedIn page
- LinkedIn HTML structure might have changed
- Update selectors in `extension/content/content.js`

### Auth not working
- Check backend logs
- Verify token in Chrome Storage
- Clear extension storage: DevTools → Application → Storage

### Contacts not syncing
- Check network tab for API errors
- Verify backend is running
- Check auth token is valid

---

## 📁 Project Structure

```
LinkedInLS/
├── backend/              # API Server
│   ├── src/
│   │   ├── routes/       # Auth, Contacts routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # JWT auth
│   │   └── config/       # Passport OAuth
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── .env             # Environment variables
│
├── frontend/            # React Dashboard
│   ├── src/
│   │   ├── pages/       # Login, Register, Contacts
│   │   ├── services/    # API client
│   │   └── store/       # Zustand auth store
│   └── .env             # Frontend config
│
└── extension/           # Browser Extension
    ├── popup/           # Extension UI
    ├── content/         # LinkedIn scraper
    ├── background/      # Service worker
    └── manifest.json    # Extension config
```

---

## 🎉 Next Steps

### Immediate Features
- [ ] Add tags to contacts
- [ ] Add notes to contacts
- [ ] Bulk actions (delete, export selected)
- [ ] Contact detail page

### Advanced Features
- [ ] Salesforce integration
- [ ] HubSpot sync
- [ ] Email finder integration
- [ ] Auto-enrichment (company, phone, etc.)
- [ ] Analytics dashboard
- [ ] Team collaboration

### Scaling
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] Background jobs (Bull/BullMQ)
- [ ] Webhook notifications
- [ ] API rate limits

---

## 📞 Support

Need help? Check:
- Backend logs: Terminal running `npm run dev`
- Frontend logs: Browser DevTools Console
- Extension logs: Extension popup → Right-click → Inspect

---

**Built with ❤️ - Ready for LinkedIn & Salesforce integration!**
