
  ---
  Projektübersicht
  
  CompanyCentral ist eine mandantenfähige SaaS-Anwendung zur Unternehmens- und Mitarbeiterverwaltung. Gebaut mit dem MERN-Stack (MongoDB, Express, React, Node.js).

  ---
  Technologien
  
  ┌───────────────────┬──────────────────────────────┐
  │      Bereich      │         Technologie          │
  ├───────────────────┼──────────────────────────────┤
  │ Frontend          │ React 19 + Vite 8            │
  ├───────────────────┼──────────────────────────────┤
  │ Backend           │ Node.js + Express            │
  ├───────────────────┼──────────────────────────────┤
  │ Datenbank         │ MongoDB Atlas (M0 Free)      │
  ├───────────────────┼──────────────────────────────┤
  │ Authentifizierung │ JWT (Access + Refresh Token) │
  ├───────────────────┼──────────────────────────────┤
  │ Frontend-Deploy   │ Vercel                       │
  ├───────────────────┼──────────────────────────────┤
  │ Backend-Deploy    │ Render (kostenlos)           │
  └───────────────────┴──────────────────────────────┘

  ---
  Projektstruktur

  CompanyCentral/
  ├── src/                        # React Frontend
  │   ├── config.js               # Zentrale API-URL (VITE_API_URL)
  │   ├── pages/
  │   │   ├── Auth.jsx            # Login + Registrierung
  │   │   ├── Dashboard.jsx       # Hauptübersicht
  │   │   └── Pages.jsx           # Alle Seiten (Mitarbeiter, Projekte, etc.)
  │   └── data.jsx                # Demo-Daten
  ├── backend/
  │   ├── server.js               # Express-Einstiegspunkt
  │   ├── models/
  │   │   ├── User.js             # Mitarbeiter-Modell
  │   │   └── Company.js          # Unternehmens-Modell
  │   ├── routes/
  │   │   ├── auth.js             # /api/auth/* Routen
  │   │   ├── team.js             # /api/team/* Routen
  │   │   └── company.js          # /api/company/* Routen
  │   ├── middleware/
  │   │   └── auth.js             # JWT-Middleware
  │   ├── utils/
  │   │   └── tenantScope.js      # Mandantentrennung
  │   └── .env.example            # Umgebungsvariablen-Vorlage
  └── .env.example                # Frontend-Umgebungsvariablen

  ---
  Lokale Entwicklung

  Voraussetzungen

  - Node.js 18+
  - MongoDB Atlas Konto

  Frontend starten

  npm install
  npm run dev
  # Läuft auf http://localhost:5173

  Backend starten

  cd backend
  npm install
  cp .env.example .env
  # .env ausfüllen (siehe unten)
  node server.js
  # Läuft auf http://localhost:3001

  Backend .env Variablen

  env
  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/CompanyCentral
  JWT_SECRET=langer-zufälliger-string
  JWT_REFRESH_SECRET=anderer-langer-string
  PORT=3001
  FRONTEND_ORIGIN=http://localhost:5173
  NODE_ENV=development

  Frontend .env Variablen

  env
  VITE_API_URL=http://localhost:3001

  ---
  Demo-Login

  Token: dev-mock-token
  Zeigt alle Demodaten ohne Backend-Verbindung.

  ---
  Authentifizierungssystem

  Admin-Login (E-Mail)

  POST /api/auth/login
  { email, password }

  Mitarbeiter-Login (Code)

  POST /api/auth/employee-login
  { companyId, employeeCode, password }

  Registrierung

  POST /api/auth/register
  { company: { name, industry }, admin: { name, email, password } }

  ---
  API-Endpunkte

  ┌─────────┬────────────────────────────┬─────────────────────────────────┐
  │ Methode │           Route            │          Beschreibung           │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ GET     │ /                          │ API-Info                        │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ GET     │ /api/health                │ Serverstatus + DB-Verbindung    │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ POST    │ /api/auth/register         │ Neues Unternehmen registrieren  │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ POST    │ /api/auth/login            │ Admin-Login                     │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ POST    │ /api/auth/employee-login   │ Mitarbeiter-Login               │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ GET     │ /api/team/members          │ Alle Mitarbeiter abrufen        │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ POST    │ /api/team/members          │ Mitarbeiter erstellen           │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ PUT     │ /api/team/members/:id      │ Mitarbeiter bearbeiten          │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ PUT     │ /api/team/members/:id/code │ Mitarbeitercode ändern          │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ DELETE  │ /api/team/members/:id      │ Mitarbeiter löschen             │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ GET     │ /api/company               │ Unternehmensdaten               │
  ├─────────┼────────────────────────────┼─────────────────────────────────┤
  │ PUT     │ /api/company               │ Unternehmensdaten aktualisieren │
  └─────────┴────────────────────────────┴─────────────────────────────────┘

  ---
  Mandantentrennung

  Jede Datenbankabfrage wird über tenantScope.js geleitet — direkte Model.find() Aufrufe sind verboten. Jeder Datensatz enthält eine companyId und wird automatisch gefiltert.

  ---
  Mitarbeiter-Codes

  - Format: EMP-001, EMP-002 ...
  - Automatisch generiert bei Erstellung
  - Vom Admin änderbar
  - Eindeutig pro Unternehmen

  ---
  Produktions-Deploy

  ┌───────────────────┬──────────────────────────────────────────┐
  │      Service      │                   URL                    │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Frontend (Vercel) │ https://company-central-green.vercel.app │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Backend (Render)  │ https://companycentral.onrender.com      │
  └───────────────────┴──────────────────────────────────────────┘

  Vercel Umgebungsvariablen

  VITE_API_URL=https://companycentral.onrender.com

  Render Umgebungsvariablen

  MONGODB_URI=...
  JWT_SECRET=...
  JWT_REFRESH_SECRET=...
  FRONTEND_ORIGIN=https://company-central-green.vercel.app
  NODE_ENV=production

  ---
  Autor

  Rigo Erisk Reyes — EriskReyes
