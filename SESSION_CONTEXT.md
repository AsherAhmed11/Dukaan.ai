# Dukaan.ai — Session Context

> Running log of all prompts and decisions made during this build session.
> Add to this file at the start of every new session so AI has full context.

---

## Session 1 — 2026-09-04

---

### Prompt 1 — Initial Request
> "Set up a MERN project skeleton. Backend: Express + Mongoose with a User model (name, phone, email, passwordHash, preferredLanguage) and a Business model. Include basic JWT auth middleware. Don't add any AI logic yet — just the schema, models, and auth scaffolding."

**Decision / Answer:**
- Identified that no Business schema was pasted — created an implementation plan with an inferred schema and asked for confirmation before building.
- Held execution until schema was confirmed.

---

### Prompt 2 — Full Schema + Product Spec
User provided the complete product definition:

**User Model (confirmed final):**
```js
User {
  _id, name, phone, email, passwordHash,
  preferredLanguage: "ur" | "en",
  createdAt
}
```

**Business Model (confirmed final):**
```js
Business {
  _id, ownerId (ref User),
  slug: String (unique),
  rawInputText: String,         // original typed/transcribed input — stored for audit + reprocessing
  rawInputLanguage: "ur" | "en",

  // AI-extracted fields (all nullable — filled by Gemini in Phase 2)
  businessName: String,
  category: String,
  tagline: String,
  about: String,
  services: [{ name, description, price }],
  location: { area, city, address },
  contact: { phone, whatsapp },
  hours: String,
  themeColor: String,           // hex color, AI-suggested

  status: "draft" | "published",
  createdAt, updatedAt
}
```

**6 API Routes (confirmed final — no more routes to be added):**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/business/generate     ← core route, AI call goes here in Phase 2
PUT    /api/business/:id          ← owner edits AI fields
PUT    /api/business/:id/publish  ← draft → published
GET    /api/business/:slug        ← PUBLIC, no auth
GET    /api/business/mine         ← owner dashboard
```

**3 Frontend Screens (confirmed final):**
1. `InputScreen` — mic + textarea + language toggle (Urdu/English) + "Generate" button
2. `ReviewScreen` — editable AI-generated fields + Publish button
3. `PublicSitePage` — public mobile-first business page at `/site/:slug`

**Voice Input Strategy:**
- Use **Web Speech API** (browser-native, free, ~20 lines)
- `lang: "ur-PK"` or `"en-US"` based on toggle
- Transcribed text feeds the same `/api/business/generate` route — backend doesn't know or care if it came from voice or typing

**Core AI Prompt (for Phase 2 — do NOT change without testing):**
```
System role: You are an assistant that turns a Pakistani small business owner's 
spoken or typed description (in Urdu, English, or Roman Urdu/mixed) into 
structured, professional website content.

Rules:
- If input is in Urdu or Roman Urdu, understand it but OUTPUT content in 
  {preferredLanguage} — clear, simple, professional tone.
- Never invent facts not implied by the input — leave fields empty if not mentioned.
- Keep tone appropriate for a local Pakistani small business — warm, direct, trustworthy.
- Extract services as a list even if described in one run-on sentence.

Output ONLY valid JSON, no preamble, no markdown fences:
{
  "businessName": string,
  "category": string,
  "tagline": string (under 12 words),
  "about": string (2-3 sentences),
  "services": [{ "name": string, "description": string, "price": string|null }],
  "location": { "area": string|null, "city": string|null },
  "contact": { "phone": string|null, "whatsapp": string|null },
  "hours": string|null,
  "themeColor": string (hex code fitting the business category's mood)
}

User's business description (language: {language}):
"{rawInputText}"
```

**Answer / What was built:**
Complete backend scaffold created at `g:\Projects\Dukaan.ai\backend\`:

```
backend/
├── server.js                          # entry point
├── src/
│   ├── app.js                         # Express app factory, middleware, routes, error handlers
│   ├── config/db.js                   # Mongoose connect with process.exit on failure
│   ├── models/
│   │   ├── User.js                    # comparePassword(), passwordHash select:false, toJSON strip
│   │   └── Business.js                # all AI fields default null, pre-save slug generator
│   ├── middleware/
│   │   ├── auth.js                    # protect + generateToken
│   │   └── validate.js                # express-validator 422 handler
│   ├── controllers/
│   │   ├── authController.js          # register, login, getMe
│   │   └── businessController.js      # generateBusiness (stub), updateBusiness, publishBusiness,
│   │                                  # getBusinessBySlug (public), getMyBusiness
│   └── routes/
│       ├── auth.js                    # 3 auth routes with validation chains
│       └── business.js                # 5 business routes — static before parameterised
├── .env.example
└── package.json
```

Frontend scaffold at `g:\Projects\Dukaan.ai\frontend\`:
- Vite + React + React Router v6
- `App.jsx` with 3 routes: `/`, `/review/:id`, `/site/:slug`
- `screens/InputScreen.jsx`, `ReviewScreen.jsx`, `PublicSitePage.jsx` — all placeholder with Phase 2 TODOs

**Key implementation decisions:**
- `email` is `sparse: true` on User — optional but unique if provided
- `passwordHash` is `select: false` — never returned in queries, must `.select('+passwordHash')` in login
- Business slug auto-generated from `businessName` (or first 40 chars of `rawInputText` if name not yet set), with random suffix if collision
- `updateBusiness` uses a field whitelist (`EDITABLE_FIELDS`) to prevent injection of `ownerId`, `status`, etc.
- `publishBusiness` guards against publishing without `businessName`
- Static routes (`/mine`, `/generate`) declared before parameterised (`/:id`, `/:slug`) in business router — critical for Express route matching

---

### Prompt 3 — Create GitHub repo and push
> "Create the GitHub repo and then push it."

**Answer:**
- `gh` CLI not installed — used git directly
- `git init` + `git add .` + `git commit` (36 files, initial MERN skeleton commit)
- User created the repo manually at `https://github.com/AsherAhmed11/Dukaan.ai`

---

### Prompt 4 — Push commands
> User provided: `git remote add origin https://github.com/AsherAhmed11/Dukaan.ai.git && git branch -M main && git push -u origin main`

**Answer:**
- Commands executed — pushed successfully
- Repo live at: **https://github.com/AsherAhmed11/Dukaan.ai**

---

## Current Project State

| Item | Status |
|------|--------|
| Backend models (User, Business) | ✅ Done |
| JWT auth middleware | ✅ Done |
| 6 API routes scaffolded | ✅ Done |
| express-validator on all inputs | ✅ Done |
| Vite + React frontend scaffold | ✅ Done |
| 3-screen routing structure | ✅ Done |
| GitHub repo | ✅ Live |
| AI integration (Gemini) | ⏳ Phase 2 |
| Web Speech API integration | ⏳ Phase 2 |
| Full UI for 3 screens | ⏳ Phase 2 |
| Railway deployment | ⏳ Phase 3 |

---

## Phase 2 — What To Build Next

1. **`backend/src/services/gemini.js`** — wrap the Gemini API call with the core prompt above
2. **Uncomment AI stub** in `businessController.js → generateBusiness`
3. **`frontend/src/screens/InputScreen.jsx`** — Web Speech API + language toggle + API call
4. **`frontend/src/screens/ReviewScreen.jsx`** — fetch business, render editable fields, publish flow
5. **`frontend/src/screens/PublicSitePage.jsx`** — mobile-first, themeColor accent, WhatsApp CTA

## Environment Setup (for new dev sessions)
```bash
# Backend
cd g:\Projects\Dukaan.ai\backend
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env
npm run dev   # runs on port 5000

# Frontend
cd g:\Projects\Dukaan.ai\frontend
npm run dev   # runs on port 5173
```

## GitHub
- **Repo:** https://github.com/AsherAhmed11/Dukaan.ai
- **Branch:** `main`
- **Git identity:** Asher Ahmed Khan / ahmedasher544@gmail.com
