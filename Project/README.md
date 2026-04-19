<div align="center">

# ⚡ JOBSPACE
### Your Professional Job Search Operating System

**A full-stack MERN application for tracking job applications, managing companies,
storing documents, and gaining analytics insights — all in one workspace.**

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Authentication & Sessions](#-authentication--sessions)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

JobSpace is a production-ready MERN stack application that acts as a full operating system for your job search. It combines a **dynamic spreadsheet engine**, **document vault**, **company tracker**, and **analytics dashboard** into one cohesive workspace — with full dark/light theming, session-based auth, and role-based access control (RBAC).

The project is architected as two **independently deployable** services:

| Service | Stack | Port |
|---------|-------|------|
| `backend/` | Node.js + Express + MongoDB | `3000` |
| `frontend/` | React + Vite | `5173` |

---

## 🛠 Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | HTTP server & routing |
| `mongoose` | ^9.3.1 | MongoDB ODM & schema validation |
| `bcryptjs` | ^2.4.3 | Password hashing (12 salt rounds) |
| `express-session` | ^1.19.0 | Session management |
| `connect-mongo` | ^4.6.0 | MongoDB-backed session store |
| `multer` | ^1.4.5-lts.1 | File upload middleware (max 10MB) |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `dotenv` | ^17.3.1 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev auto-restart (devDependency) |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM renderer |
| `react-router-dom` | ^6.20.0 | Client-side routing |
| `axios` | ^1.6.0 | HTTP client with credential support |
| `chart.js` | ^4.4.0 | Chart rendering engine |
| `react-chartjs-2` | ^5.2.0 | React wrapper for Chart.js |
| `vite` | ^5.4.21 | Dev server + bundler (devDependency) |
| `@vitejs/plugin-react` | ^4.2.0 | React fast refresh (devDependency) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Port 5173)                      │
│   React 18 + React Router v6 + Axios + Chart.js                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  AuthContext │  │ ToastContext │  │ Animated Route Guard │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │  Vite Dev Proxy → /api → :3000
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Port 3000)                    │
│   CORS → JSON Parser → Session Middleware → Route Guards        │
│   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│   │  Auth  │ │   Apps   │ │Companies │ │Documents │  ...        │
│   └────────┘ └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MONGODB                                  │
│   users │ applications │ companies │ documents │ sessions       │
│         │ spreadsheetcolumns                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow
1. React makes an Axios request to `/api/*` with `withCredentials: true`
2. Vite proxies it to `http://localhost:3000` in development
3. Express validates the session cookie via `connect-mongo`
4. Route guard (`isAuthenticated` / `isAdminAuthenticated`) checks `req.session.userId`
5. Controller queries MongoDB via Mongoose and returns JSON
6. React updates state and re-renders

---

## 📁 Project Structure

```
JOBSPACE-MERN/
│
├── backend/                          ← Express API (Node.js)
│   ├── .env                          ← Environment variables (you create this)
│   ├── package.json                  ← Backend dependencies
│   ├── app.js                        ← Entry point — CORS, middleware, routes
│   │
│   ├── config/
│   │   ├── db.js                     ← MongoDB connection via Mongoose
│   │   └── session.js                ← Session config with MongoStore
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         ← isAuthenticated, isAdminAuthenticated, isGuest
│   │   ├── roleMiddleware.js         ← Role-based access control helpers
│   │   └── uploadMiddleware.js       ← Multer config (10MB, pdf/docx/img only)
│   │
│   ├── models/
│   │   ├── User.js                   ← Schema + bcrypt pre-save hook + matchPassword
│   │   ├── Application.js            ← Job applications (named fields + extraData)
│   │   ├── Company.js                ← Company tracker with extraData Map
│   │   ├── Document.js               ← Uploaded file metadata
│   │   └── SpreadsheetColumn.js      ← Per-user column config (user + page unique index)
│   │
│   ├── controllers/
│   │   ├── authController.js         ← register, login, logout, getMe
│   │   ├── applicationController.js  ← CRUD + dynamic column patching
│   │   ├── companyController.js      ← CRUD + app count aggregation
│   │   ├── columnController.js       ← Column config get/put/patch-options
│   │   ├── dashboardController.js    ← Stats + 6-month chart + recent activity
│   │   ├── analyticsController.js    ← 12-month aggregations + rates + top companies
│   │   ├── documentController.js     ← File upload/delete with disk cleanup
│   │   ├── profileController.js      ← Profile get/update + avatar + password change
│   │   └── adminController.js        ← Admin stats, user list, role update, cascade delete
│   │
│   ├── routes/
│   │   ├── auth.js                   ← POST /login /register /logout, GET /me
│   │   ├── applications.js           ← GET / POST / PATCH /:id / DELETE /:id
│   │   ├── companies.js              ← GET / POST / PATCH /:id / DELETE /:id
│   │   ├── columns.js                ← GET /:page / PUT /:page / PATCH /:page/:colId/options
│   │   ├── documents.js              ← GET / POST (multipart) / DELETE /:id
│   │   ├── profile.js                ← GET / PUT (multipart) / PUT /password
│   │   ├── dashboard.js              ← GET /
│   │   ├── analytics.js              ← GET /
│   │   └── admin.js                  ← GET / GET /users / PUT /users/:id/role / DELETE /users/:id
│   │
│   └── uploads/                      ← Multer file storage (gitignored except .gitkeep)
│
├── frontend/                         ← React application (Vite)
│   ├── package.json                  ← Frontend dependencies
│   ├── index.html                    ← Anti-flash theme script + FOUC prevention
│   ├── vite.config.js                ← Dev proxy: /api → :3000, /uploads → :3000
│   │
│   └── src/
│       ├── main.jsx                  ← React root + all CSS imports
│       ├── App.jsx                   ← BrowserRouter + route guards + animated routes
│       │
│       ├── context/
│       │   ├── AuthContext.jsx       ← useAuth() — user state, login/register/logout
│       │   └── ToastContext.jsx      ← useToast() — auto-dismiss notifications
│       │
│       ├── hooks/
│       │   ├── useTheme.js           ← Dark/light toggle with localStorage persistence
│       │   └── useScrollReveal.js    ← Intersection Observer scroll animations
│       │
│       ├── components/
│       │   ├── Layout.jsx            ← App shell — Sidebar + <Outlet />
│       │   ├── Sidebar.jsx           ← Navigation, theme toggle, user chip, logout
│       │   ├── Modal.jsx             ← Reusable overlay modal
│       │   └── Spreadsheet.jsx       ← Full spreadsheet engine (see Features)
│       │
│       ├── pages/
│       │   ├── Landing.jsx           ← Public marketing page
│       │   ├── Login.jsx             ← Session login form
│       │   ├── Register.jsx          ← Registration form
│       │   ├── Dashboard.jsx         ← Stats cards + charts + recent activity
│       │   ├── Applications.jsx      ← Spreadsheet view for job applications
│       │   ├── Companies.jsx         ← Spreadsheet view for companies
│       │   ├── Documents.jsx         ← File upload vault (PDF, DOCX, images)
│       │   ├── Analytics.jsx         ← 12-month charts + response/offer rates
│       │   ├── Profile.jsx           ← Profile editor + avatar + password change
│       │   ├── AdminDashboard.jsx    ← Admin stats overview
│       │   ├── AdminUsers.jsx        ← User management (role update, delete)
│       │   └── AdminLogin.jsx        ← Hidden admin login (/admin/login)
│       │
│       ├── services/
│       │   └── api.js                ← Axios instance + all API service functions
│       │
│       └── styles/
│           ├── theme.css             ← CSS variables — dark/light tokens
│           ├── globals.css           ← Global layout, cards, buttons, utilities
│           ├── animations.css        ← Keyframes, transitions, route-enter
│           ├── components.css        ← Sidebar, auth, profile, docs, admin styles
│           ├── spreadsheet.css       ← Complete spreadsheet styling
│           └── landing.css           ← Landing page styles
│
└── README.md
```

---

## ✨ Features

### 🗂 Spreadsheet Engine (`Spreadsheet.jsx`)
The core of the application — a fully custom spreadsheet built from scratch with no third-party table library.

- **Inline editing** — click any cell to edit, blur to auto-save
- **Per-row debounce** — 400ms delay prevents excessive API calls
- **`sendBeacon` flush** — unsaved changes are committed even on tab close/navigation
- **Dynamic columns** — add, rename, reorder, and delete columns; config persisted in MongoDB per user per page
- **Column types** — `text`, `number`, `date`, `dropdown`
- **Dropdown badges** — color-coded labels (`blue`, `purple`, `yellow`, `green`, `red`, `orange`, `pink`, `gray`)
- **Custom calendar** — no native `<input type="date">` — fully custom fixed-position date picker
- **Column drag-drop** — reorder via HTML5 Drag API
- **Column resize** — drag the right border of any column header
- **Filter tabs** — dynamically built from the `status` column's dropdown options
- **Search** — instant client-side full-row text search
- **Sort** — click any column header to sort ascending/descending
- **CSV export** — downloads all visible rows as a `.csv` file

### 🔐 Auth System
- Session-based authentication (no JWT)
- `express-session` with `connect-mongo` store — sessions survive server restarts
- 7-day cookie with `HttpOnly: true`, `secure: true` in production
- Passwords hashed with `bcryptjs` at 12 salt rounds
- Route guards: `PrivateRoute`, `AdminRoute`, `GuestRoute`
- Admin panel accessible only via direct URL (`/admin/login`) — no UI links

### 📊 Analytics & Dashboard
- **Dashboard** — 6-month application timeline + status breakdown + recent activity feed
- **Analytics** — 12-month trends, response rate, offer rate, top companies chart, job type distribution
- All chart data computed server-side via MongoDB aggregation pipelines

### 🎨 Theming
- Dark / Light mode only (no system-default ambiguity)
- Anti-flash script in `index.html` runs synchronously before first paint
- FOUC prevention via `html { visibility: hidden }` until `ready` class is added
- CSS custom properties (variables) for full token-based theming
- `localStorage` persistence via `useTheme` hook

### 👤 Profile & Documents
- Avatar upload with automatic deletion of the old avatar on update
- Profile fields: name, job title, location, bio
- Password change with old-password verification
- Document vault: upload PDF, DOCX, DOC, PNG, JPG, JPEG (max 10MB)
- Files stored in `backend/uploads/` with UUID-based filenames

---

## ✅ Prerequisites

Before you begin, make sure you have:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x | `node --version` |
| npm | 8.x | `npm --version` |
| MongoDB | 6.x (local) or Atlas | `mongod --version` |

**MongoDB options:**
- **Local**: Install from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) and run `mongod`
- **Cloud (recommended)**: Free tier at [mongodb.com/atlas](https://www.mongodb.com/atlas) — no local install needed

---

## 🚀 Local Development Setup

### Step 1 — Clone / Extract the project

```bash
cd JOBSPACE-MERN
```

### Step 2 — Create the backend environment file

Create a file at `backend/.env`:

```bash
# backend/.env
PORT=3000
MONGO_URI=mongodb://localhost:27017/jobspace
SESSION_SECRET=jobspace_super_secret_key_change_me
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> ⚠️ **Critical:** The variable name must be `MONGO_URI` — not `MONGODB_URI`.
> Both `db.js` and `session.js` read `process.env.MONGO_URI` exactly.

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 4 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Step 5 — Start the backend

Open **Terminal 1** and run:

```bash
cd backend
npm run dev
```

Expected output:
```
[nodemon] starting `node app.js`
🚀 JobSpace API running on http://localhost:3000
✅ MongoDB Connected: localhost
```

### Step 6 — Start the frontend

Open **Terminal 2** and run:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

### Step 7 — Open the app

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Environment Variables

All environment variables live in `backend/.env`. The frontend has no `.env` file — the Vite proxy handles the backend URL.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Port the Express server listens on |
| `MONGO_URI` | **Yes** | — | Full MongoDB connection string |
| `SESSION_SECRET` | **Yes** | `'jobspace_secret_key'` (insecure fallback) | Secret used to sign session cookies — use a long random string in production |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | CORS allowed origin — set to your frontend URL in production |
| `NODE_ENV` | No | — | Set to `production` to enable secure cookies (HTTPS only) |

### Example — MongoDB Atlas URI

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.abc12.mongodb.net/jobspace?retryWrites=true&w=majority
```

---

## 📡 API Reference

All routes are prefixed with `/api`. Protected routes require a valid session cookie.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/login` | Guest | Login with email + password, sets session |
| `POST` | `/register` | Guest | Register new user, sets session |
| `POST` | `/logout` | Any | Destroy session |
| `GET` | `/me` | Protected | Returns current user from session |

### Applications — `/api/applications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | Get all applications + column config |
| `POST` | `/` | Protected | Create a new application row |
| `PATCH` | `/:id` | Protected | Inline cell update (named fields + extraData) |
| `DELETE` | `/:id` | Protected | Delete application |

### Companies — `/api/companies`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | Get all companies + column config + app counts |
| `POST` | `/` | Protected | Create new company |
| `PATCH` | `/:id` | Protected | Inline cell update |
| `DELETE` | `/:id` | Protected | Delete company |

### Columns — `/api/columns`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/:page` | Protected | Get column config for `applications` or `companies` |
| `PUT` | `/:page` | Protected | Replace entire column array |
| `PATCH` | `/:page/:colId/options` | Protected | Update dropdown options for a specific column |

### Documents — `/api/documents`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | Get all uploaded documents |
| `POST` | `/` | Protected | Upload file (`multipart/form-data`) |
| `DELETE` | `/:id` | Protected | Delete document + remove file from disk |

### Profile — `/api/profile`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | Get profile + stats |
| `PUT` | `/` | Protected | Update name/title/location/bio + optional avatar (`multipart/form-data`) |
| `PUT` | `/password` | Protected | Change password (requires old password) |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | Stats, 6-month chart, recent apps, recent docs |

### Analytics — `/api/analytics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Protected | 12-month trends, response rate, offer rate, top companies, job types |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Admin | Platform-wide stats |
| `GET` | `/users` | Admin | All users list |
| `PUT` | `/users/:id/role` | Admin | Update user role (`user` \| `admin`) |
| `DELETE` | `/users/:id` | Admin | Cascade delete user + all their data |

---

## 🗃 Data Models

### User
```javascript
{
  name:      String (required, trimmed),
  email:     String (required, unique, lowercase),
  password:  String (hashed — never returned in responses),
  role:      'user' | 'admin' (default: 'user'),
  avatar:    String (filename in uploads/),
  title:     String,
  location:  String,
  bio:       String,
  lastLogin: Date,
  timestamps: true
}
```

### Application
```javascript
{
  user:        ObjectId → User (required),
  jobTitle:    String (default: 'New Role'),
  company:     String (default: 'Company Name'),
  companyRef:  ObjectId → Company,
  location:    String,
  salary:      String,
  status:      String (options come from SpreadsheetColumn, not enum),
  appliedDate: Date,
  notes:       String,
  extraData:   Mixed (key: columnId → value: String),
  // Legacy fields
  jobType, jobDescription, jobUrl,
  timestamps: true,
  strict: false  // allows unknown fields
}
```

### Company
```javascript
{
  user:           ObjectId → User (required),
  name:           String (required),
  status:         'Dream' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | '',
  priority:       String,
  lastContact:    String,
  recruiterName:  String,
  recruiterEmail: String,
  linkedin:       String,
  notes:          String,
  extraData:      Map<String, String>,
  timestamps: true
}
```

### SpreadsheetColumn
```javascript
{
  user: ObjectId → User (required),
  page: 'applications' | 'companies' (required),
  columns: [{
    id:      String (e.g. 'status', 'custom_abc123'),
    label:   String,
    type:    'text' | 'number' | 'date' | 'dropdown',
    options: [{ label: String, color: 'blue|purple|yellow|green|red|orange|pink|gray' }],
    order:   Number,
    width:   Number (px),
    dbField: Boolean (true = maps to named model field)
  }],
  // Compound unique index: { user: 1, page: 1 }
}
```

### Document
```javascript
{
  user:         ObjectId → User (required),
  name:         String (required),
  type:         'Resume' | 'Cover Letter' | 'Portfolio' | 'Certificate' | 'Other',
  filename:     String (UUID-based name on disk),
  originalName: String (user's original filename),
  mimetype:     String,
  size:         Number (bytes),
  timestamps: true
}
```

---

## 🔒 Authentication & Sessions

JobSpace uses **session-based auth** (not JWT). Here's why this matters:

- Sessions are stored in MongoDB via `connect-mongo` — they survive server restarts
- Cookies are `HttpOnly` (not accessible to JavaScript) — XSS safe
- `secure: true` is enabled automatically when `NODE_ENV=production` — forces HTTPS
- Session duration: **7 days** (`maxAge: 1000 * 60 * 60 * 24 * 7`)
- Session data stored: `userId`, `userName`, `userRole`, `userAvatar`

### Route Guard Middleware

```
isAuthenticated      → requires req.session.userId
isAdminAuthenticated → requires userId + role === 'admin'
isGuest              → rejects if already authenticated
```

### Admin Access

The admin panel is intentionally hidden — there are no links to it in the UI. Access it by navigating directly to:

```
http://localhost:5173/admin/login
```

To create an admin user, register normally then update the role via MongoDB directly, or use an existing admin account via the Admin Users panel.

---

## 🌐 Deployment Guide

The backend and frontend are **independent services** — deploy them separately.

### Backend Deployment (Render / Railway / Heroku)

1. Connect your repository
2. Set **Root Directory** to `backend/`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add these environment variables in your platform's dashboard:

```
PORT=10000                         # or whatever your platform assigns
MONGO_URI=mongodb+srv://...        # your Atlas connection string
SESSION_SECRET=<long-random-string>
CLIENT_ORIGIN=https://your-frontend-url.com
NODE_ENV=production
```

> 💡 Generate a strong `SESSION_SECRET`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Frontend Deployment (Vercel / Netlify / Render Static)

1. Connect your repository
2. Set **Root Directory** to `frontend/`
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `dist/`
5. Add environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

> ⚠️ **Important:** In production, the Vite dev proxy no longer exists. Update `frontend/src/services/api.js`:
> ```javascript
> const api = axios.create({
>   baseURL: import.meta.env.VITE_API_URL + '/api',
>   withCredentials: true,
> });
> ```

### Session Cookies Cross-Origin (Production)

When frontend and backend are on different domains, add `sameSite: 'none'` to your session cookie config in `backend/config/session.js`:

```javascript
cookie: {
  maxAge:   1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}
```

---

## 🐛 Troubleshooting

### `TypeError: next is not a function` in User.js

**Cause:** Mongoose 9 changed async pre-hook behavior — `next` is no longer passed.

**Fix:** Update the `pre('save')` hook in `backend/models/User.js`:

```javascript
// ❌ Old (Mongoose 7/8)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Fixed (Mongoose 9)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

---

### `❌ MongoDB connection error` on startup

1. Check that MongoDB is running: `mongod` (local) or verify Atlas URI
2. Confirm your `.env` is at `backend/.env` (not the project root)
3. Confirm the variable is `MONGO_URI` (not `MONGODB_URI`)
4. If using Atlas, whitelist your IP address in Network Access settings

---

### Session not persisting (logged out on refresh)

1. Ensure `withCredentials: true` is set on the Axios instance in `api.js`
2. In development, confirm the Vite proxy is running and routing to port 3000
3. In production, ensure `sameSite: 'none'` and `secure: true` are set (see Deployment Guide above)

---

### File uploads failing

1. Confirm the `backend/uploads/` directory exists (it's auto-created by `uploadMiddleware.js`)
2. Confirm the file type is allowed: `pdf`, `docx`, `doc`, `png`, `jpg`, `jpeg`
3. File size limit is **10MB** — check that your file is under this limit

---

### `npm install` installs wrong packages

Always install from each service's own folder:

```bash
# ✅ Correct
cd backend  && npm install
cd frontend && npm install

# ❌ Wrong — root package.json is a legacy leftover, do not use it
cd JOBSPACE-MERN && npm install
```

---

### Port already in use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill the process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ☕ and MERN — **JobSpace v3.0**

</div>
