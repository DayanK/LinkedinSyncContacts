# LinkedIn Contact Sync 🔗

Professional LinkedIn contact management system - Extract, sync, and manage your LinkedIn connections with cloud backup and multi-device access.

## ✨ What's Built

🎉 **Complete professional-grade system ready to use!**

- ✅ **Backend API** - Node.js + Express + SQLite + JWT Auth
- ✅ **Web Dashboard** - React + TypeScript + Tailwind CSS
- ✅ **Browser Extension** - Chrome/Firefox with auto-sync
- ✅ **Authentication** - Email/Password + LinkedIn OAuth ready
- ✅ **Cloud Sync** - All contacts backed up to database
- ✅ **CSV Export** - Download all contacts
- ✅ **Search & Filter** - Find contacts instantly
- ✅ **Multi-device** - Access from anywhere

## 🚀 Quick Start (3 steps)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
✅ Running on http://localhost:3001

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Running on http://localhost:5173

### 3. Load Extension
1. Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/` folder

**→ See [SETUP.md](SETUP.md) for detailed guide**

## 📸 How It Works

```
LinkedIn → Extension (scrape) → Backend API → Database
                                      ↓
                              Web Dashboard (search/export)
```

1. Install extension & sign in
2. Go to LinkedIn connections
3. Click "Extract contacts"
4. Contacts sync to cloud
5. View/search/export from web dashboard

## 🛠️ Tech Stack

**Backend**
- Node.js, Express, TypeScript
- SQLite (dev) → PostgreSQL/MongoDB (prod)
- Prisma ORM
- JWT + Passport (LinkedIn OAuth)

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS
- TanStack Query, Zustand
- React Router v6

**Extension**
- Manifest V3 (Chrome/Firefox)
- Auto-sync to backend
- Beautiful UI

## 🔐 Features

### Current (v1.0)
- [x] User registration & login
- [x] LinkedIn OAuth integration
- [x] Contact extraction from LinkedIn
- [x] Cloud sync & backup
- [x] Search & filter contacts
- [x] CSV export
- [x] Multi-device access
- [x] Browser extension (Chrome/Firefox)

### Next (v2.0)
- [ ] **Salesforce integration** 🎯
- [ ] Contact enrichment (email, phone)
- [ ] Tags & notes
- [ ] Team collaboration
- [ ] Analytics dashboard
- [ ] HubSpot sync

## 📁 Project Structure

```
LinkedInLS/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/       # Auth, Contacts API
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # JWT auth
│   │   └── config/       # Passport OAuth
│   ├── prisma/
│   │   └── schema.prisma # Database models
│   └── .env             # Config
│
├── frontend/            # React Dashboard
│   ├── src/
│   │   ├── pages/       # Login, Contacts
│   │   ├── services/    # API client
│   │   └── store/       # Auth state
│   └── .env
│
└── extension/           # Browser Extension
    ├── popup/           # UI + Auth
    ├── content/         # LinkedIn scraper
    └── manifest.json
```

## 🌐 Deploy to Production

**Backend** → Railway, Render, Fly.io
**Frontend** → Vercel, Netlify
**Database** → Supabase, Neon, PlanetScale

Migration from SQLite to PostgreSQL:
```bash
# Update backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"  # Change from sqlite
}

# Migrate
npm run prisma:migrate
```

## 📊 Database Schema

```prisma
model User {
  id        String   @id
  email     String   @unique
  password  String
  contacts  Contact[]
}

model Contact {
  id          String   @id
  linkedInId  String
  name        String
  title       String?
  company     String?
  profileUrl  String
  user        User     @relation
}
```

## 🔧 Configuration

**Backend `.env`**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
LINKEDIN_CLIENT_ID="optional"
LINKEDIN_CLIENT_SECRET="optional"
```

**Frontend `.env`**
```env
VITE_API_URL="http://localhost:3001/api"
```

## 📝 API Endpoints

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/linkedin
  GET    /api/auth/me

Contacts
  GET    /api/contacts
  POST   /api/contacts/sync
  GET    /api/contacts/stats
  PATCH  /api/contacts/:id
  DELETE /api/contacts/:id
```

## 🐛 Troubleshooting

**Extension not working?**
- Reload extension after code changes
- Check console (F12) on LinkedIn
- Verify backend is running

**Contacts not syncing?**
- Check extension is signed in
- Verify network tab for API calls
- Check backend logs

**LinkedIn structure changed?**
- Update selectors in `extension/content/content.js`
- Test with `document.querySelectorAll('a[href*="/in/"]')`

## 🎯 Salesforce Integration (Next)

Coming soon:
- Bi-directional sync LinkedIn ↔ Salesforce
- Auto-create leads from contacts
- Enrich Salesforce with LinkedIn data
- Bulk operations

## 📄 License

MIT - Free to use for personal and commercial projects

---

**⭐ Built with modern tech - Ready for production!**

**Next step:** Follow [SETUP.md](SETUP.md) to get started in 5 minutes!
