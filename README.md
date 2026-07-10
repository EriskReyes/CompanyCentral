<div align="center">

# 🏢 CompanyCentral

**Multi-tenant company management platform (SaaS)**

Every company gets its own isolated workspace — employees, projects, tasks, clients, documents, messages and meetings, all in one place.

[**🌐 Live Demo**](https://company-central-green.vercel.app) · [**⚙️ API**](https://companycentral.onrender.com) · [**👤 Author**](https://github.com/EriskReyes)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&labelColor=20232a)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white&labelColor=20232a)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white&labelColor=20232a)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&labelColor=20232a)
![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?logo=jsonwebtokens&logoColor=white&labelColor=20232a)

</div>

---

## ✨ Features

**18 fully functional pages** — Dashboard, Employees, Departments, Teams, Projects, Tasks (Kanban), Schedule, Attendance (with CSV export), Documents, Files, Announcements, Clients, Invoices, Reports, Messages, Meetings, Notifications and Settings.

**True multi-tenancy** — every database query is routed through a tenant scope layer (`tenantScope.js`). Direct `Model.find()` calls are architecturally forbidden; every read and write is automatically filtered by `companyId`, so one company can never see another company's data.

**Two login methods** — administrators sign in with email + password; employees sign in with their company ID, a personal employee code (`EMP-001`, `EMP-002`, …) and a password. The admin account is created automatically as `ADM-001` when a workspace is registered.

**Modern token security** — short-lived access tokens (20 min) combined with 7-day refresh tokens stored in `httpOnly` cookies, password hashing with bcrypt (12 rounds), and strict CORS with an explicit origin allowlist.

**Design system built in** — 4 accent colors, dark/light theme, 2 sidebar styles and 3 density levels, all configurable live from the tweaks panel and persisted locally.

**Demo mode** — explore the full UI with realistic sample data without creating an account.

---

## 🏗️ Architecture

```
┌─────────────────┐        HTTPS / JSON        ┌──────────────────┐
│  React 19 (Vite) │  ───────────────────────▶ │  Express API      │
│  Vercel          │  ◀───────────────────────  │  Render           │
└─────────────────┘   JWT Bearer + Cookies     └────────┬─────────┘
                                                        │ Mongoose
                                                        ▼
                                               ┌──────────────────┐
                                               │  MongoDB Atlas    │
                                               │  (tenant-scoped)  │
                                               └──────────────────┘
```

```
CompanyCentral/                 # Monorepo
├── src/                        # React frontend (Vite)
│   ├── App.jsx                 # Routing + auth state
│   ├── config.js               # Central API URL (VITE_API_URL)
│   ├── layout.jsx              # Sidebar + top bar
│   ├── ui.jsx                  # Reusable UI components
│   ├── tweaks-panel.jsx        # Live design settings
│   └── pages/                  # All 18 application pages
│
├── backend/                    # Node.js + Express API
│   ├── server.js               # Entry point, CORS, DB connection
│   ├── models/                 # User (30+ fields), Company
│   ├── routes/                 # auth, team, company
│   ├── middleware/auth.js      # JWT verification, req.scope
│   └── utils/tenantScope.js    # Multi-tenant isolation layer
│
├── vercel.json                 # Frontend deploy config
└── vite.config.js              # Dev proxy /api → localhost:3001
```

---

## 🔌 API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/health` | — | DB status + uptime |
| `POST` | `/api/auth/register` | — | Register a new company workspace |
| `POST` | `/api/auth/login` | — | Admin login (email + password) |
| `POST` | `/api/auth/employee-login` | — | Employee login (company + code) |
| `POST` | `/api/auth/refresh` | Cookie | Renew access token |
| `GET/POST` | `/api/team/members` | JWT | List / create employees |
| `PUT/DELETE` | `/api/team/members/:id` | JWT | Update / delete employee |
| `PUT` | `/api/team/members/:id/code` | JWT | Change employee code |
| `GET/PUT` | `/api/company` | JWT | Read / update company data |

All protected routes require the header `Authorization: Bearer <token>`.

---

## 🚀 Getting Started (local)

**Prerequisites:** Node.js ≥ 20, a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

**1. Clone**

```bash
git clone https://github.com/EriskReyes/CompanyCentral.git
cd CompanyCentral
```

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env    # fill in your values (see below)
npm run dev             # → http://localhost:3001
```

**3. Frontend** (new terminal, repo root)

```bash
npm install
npm run dev             # → http://localhost:5173
```

The Vite dev proxy forwards `/api/*` to `localhost:3001` automatically — no CORS setup needed in development.

---

## 🔐 Environment Variables

**Frontend** (`.env` in repo root)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `https://companycentral.onrender.com` | Backend base URL (baked in at build time) |

**Backend** (`backend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb+srv://…/CompanyCentral` | Atlas connection string |
| `JWT_SECRET` | *random 32+ char string* | Signs access tokens |
| `JWT_REFRESH_SECRET` | *different random string* | Signs refresh tokens |
| `PORT` | `3001` | API port (Render sets its own) |
| `FRONTEND_ORIGIN` | `https://company-central-green.vercel.app` | CORS allowlist (comma-separated) |
| `NODE_ENV` | `production` | Environment flag |

> ⚠️ Never commit real `.env` files. Only `.env.example` templates belong in the repo.

---

## ☁️ Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | **Vercel** | Auto-deploy on push to `main` |
| Backend | **Render** (free tier) | Root dir `backend`, start command `node server.js` |
| Database | **MongoDB Atlas** | M0 free cluster |

> ℹ️ The backend runs on Render's free tier and spins down after inactivity — the **first request may take up to ~50 seconds** while the instance wakes up.

---

## 🧭 Roadmap

- [ ] Real-time chat and live notifications with **Socket.io**
- [ ] File uploads with cloud storage
- [ ] Role-based permission granularity (admin · manager · hr · lead · employee · guest)
- [ ] PWA support for mobile
- [ ] Automated tests (Jest + Supertest)

---

## 👤 Author

**Rigo Erisk Reyes** — Application Developer (EFZ) in training, Zürich 🇨🇭

GitHub [@EriskReyes](https://github.com/EriskReyes) · Web [rikroig.dev](https://rikroig.dev) · ✉️ rigo.erick.reyes@gmail.com

---

<div align="center">
<sub>Built with focus, discipline and <em>el estado del rey</em> 👑</sub>
</div>
