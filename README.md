# Dukaan.ai

> Turn a Pakistani small business owner's spoken or typed description into a live mini-website — in Urdu or English.

## Stack

| Layer | Tech |
|-------|------|
| Backend API | Node.js · Express · Mongoose |
| Database | MongoDB |
| Auth | JWT (Bearer token) |
| Frontend | Vite · React · React Router v6 |
| AI (Phase 2) | Google Gemini API |
| Voice input | Web Speech API (browser-native) |

---

## Project Structure

```
dukaan-ai/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js           # name, phone, email, passwordHash, preferredLanguage
│   │   │   └── Business.js       # full business schema with AI-extracted fields
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT protect + generateToken
│   │   │   └── validate.js       # express-validator error handler
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── businessController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── business.js
│   │   └── app.js
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx               # 3-screen routing
        └── screens/
            ├── InputScreen.jsx   # mic + text + language toggle
            ├── ReviewScreen.jsx  # editable AI fields + publish
            └── PublicSitePage.jsx # public mobile-first page
```

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Reference

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create owner account |
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/auth/me` | ✅ Bearer | Returns current user |

### Business

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/business/generate` | ✅ Bearer | Core route — save raw input, call Gemini (Phase 2), return draft |
| PUT | `/api/business/:id` | ✅ Bearer | Edit any AI-generated field |
| PUT | `/api/business/:id/publish` | ✅ Bearer | Promote draft → published |
| GET | `/api/business/:slug` | — | Public business page data |
| GET | `/api/business/mine` | ✅ Bearer | Owner's own business |

---

## Environment Variables

See `backend/.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string (≥ 32 chars) |
| `JWT_EXPIRE` | Token lifetime, e.g. `7d` |
| `GEMINI_API_KEY` | Phase 2 — leave blank for now |

---

## Phase 2 Checklist (AI Integration)

- [ ] Add `GEMINI_API_KEY` to `.env`
- [ ] Create `backend/src/services/gemini.js` — wraps Gemini API call with the core prompt
- [ ] Uncomment AI call in `businessController.js → generateBusiness`
- [ ] Wire up Web Speech API in `InputScreen.jsx`
- [ ] Build full UI for all 3 screens
- [ ] Deploy backend to Railway, frontend to Vercel/Netlify
