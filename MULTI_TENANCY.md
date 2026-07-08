# Multi-Tenancy Implementierungsleitfaden

## Übersicht

WorkCentral unterstützt jetzt vollständiges Multi-Tenancy. Jede Firma, die sich registriert, erhält eine eindeutige **Company ID** im Format `WC-YYYY-XXXX` (z.B. `WC-2026-A7K2`).

## Authentifizierungsablauf

### Registrierung (Sign Up)
1. Benutzer öffnet den Registrierungsbildschirm
2. Schritt 1: Gibt Firmenname und Branche ein
3. Schritt 2: Gibt Name, E-Mail und Passwort des Admins ein
4. System generiert automatisch:
    - Eindeutige **Company ID** (WC-YYYY-XXXX)
    - JWT-Authentifizierungstoken
    - Admin-Benutzerprofil

**Erwarteter Endpoint**: `POST /api/auth/register`
```json
{
  "company": { "name": "Acme Inc.", "industry": "Technology" },
  "admin": { "name": "Jane Doe", "email": "jane@acme.com", "password": "secret123" }
}
```

**Antwort**:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "U-101",
    "name": "Jane Doe",
    "email": "jane@acme.com",
    "role": "admin",
    "companyId": "WC-2026-A7K2"
  },
  "company": {
    "companyId": "WC-2026-A7K2",
    "name": "Acme Inc.",
    "industry": "Technology",
    "adminId": "U-101",
    "plan": "starter",
    "createdAt": "2026-06-10T..."
  }
}
```

### Login
Benutzer gibt E-Mail und Passwort ein. System validiert die Zugangsdaten und gibt Daten gefiltert nach companyId zurück.

**Erwarteter Endpoint**: `POST /api/auth/login`
```json
{
  "email": "jane@acme.com",
  "password": "secret123"
}
```

**Antwort**: Gleich wie bei der Registrierung (token, user, company)

## Authentifizierungsstatus (Frontend)

Der Status wird in localStorage gespeichert:
```javascript
localStorage.getItem('authToken')    // JWT-Token
localStorage.getItem('user')         // User-Objekt + companyId
localStorage.getItem('company')      // Company-Objekt + companyId
```

## Teamverwaltung (Team Management)

Admins können neue Benutzer unter **Settings → Team Management** erstellen.

### Benutzer erstellen
1. Auf "Add member" klicken
2. Eingeben:
    - Vollständiger Name
    - E-Mail
    - Rolle (Employee, Manager, HR, Team Leader, Admin)
3. System generiert ein temporäres Passwort und sendet es per E-Mail

**Erwarteter Endpoint**: `POST /api/team/members`
```json
{
  "name": "John Smith",
  "email": "john@acme.com",
  "role": "manager",
  "companyId": "WC-2026-A7K2"
}
```

**Antwort**:
```json
{
  "id": "U-102",
  "name": "John Smith",
  "email": "john@acme.com",
  "role": "manager",
  "companyId": "WC-2026-A7K2",
  "tempPassword": "aB7xK9mL",
  "status": "Invited"
}
```

### Schnittstellen (Interfaces)

**src/pages/Auth.jsx**
- `Login`: Login-Bildschirm mit E-Mail + Passwort
- `Register`: Registrierungsbildschirm (2 Schritte)

**src/pages/Pages.jsx - Settings**
- Neuer Tab: "Team Management" (nur für Admins)
- Liste der Teammitglieder
- Formular zum Hinzufügen von Mitgliedern
- Firmeninformationen (Company ID, Name, Branche)

## Datenstruktur (Frontend)

### User-Objekt
```javascript
{
  id: "U-101",
  name: "Jane Doe",
  email: "jane@acme.com",
  role: "admin",          // admin, manager, hr, lead, employee, guest
  companyId: "WC-2026-A7K2",
  title: "VP Engineering",
  dept: "Engineering"
}
```

### Company-Objekt
```javascript
{
  companyId: "WC-2026-A7K2",
  name: "Acme Inc.",
  industry: "Technology",
  adminId: "U-101",
  plan: "starter",        // starter, professional, enterprise
  createdAt: "2026-06-10T12:00:00Z"
}
```

## Datenfilterung nach CompanyId

**Prinzip**: Alle angezeigten Daten müssen nach der companyId des aktuellen Benutzers gefiltert werden.

### Helper-Funktion (data.jsx)
```javascript
export function filterByCompanyId(data, companyId) {
  if (!companyId || !data) return data;
  // Backend filtert nach: WHERE companyId = ?
  // Frontend erhält bereits gefilterte Daten von der API
  return data;
}
```

### Implementierung in den Seiten
Jede Seite, die Daten anzeigt, mus `company` als Prop übergeben und nach `company.companyId` filtern:

```javascript
// In App.jsx
<Page
  role={currentUserData?.role}
  access={access}
  currentUser={currentUser}
  company={companyData}    // ← Hier übergeben
  onNavigate={navigate}
/>
```

## Logout

Beim Logout:
1. localStorage wird geleert
2. Die Zustände werden geleert (authToken, currentUserData, companyData)
3. Weiterleitung zum Login-Bildschirm

**Zugriff**: Klick auf Benutzer-Avatar → "Sign out"

## Aktualisierte Sidebar

Zeigt jetzt:
- Firmenname
- Company ID (WC-YYYY-XXXX)
- Benutzermenü mit Optionen:
    - Settings
    - Sign out

## Rollen und Berechtigungen

Die Berechtigungen werden durch Rolle + spezifischen Zugriff auf jede Seite gesteuert:

```javascript
const ACCESS = {
  dienstplan: { full: ["admin","hr","manager","lead"], view: ["employee","guest"] },
  personalreglement: { full: ["admin","hr"], view: ["manager","lead","employee","guest"] },
  vademecum: { full: ["admin","hr","manager","lead","employee"], view: ["guest"] },
  // ... andere
}
```

## Nächste Schritte für das Backend

### MongoDB-Modelle

**Company.js**
```javascript
{
  _id: ObjectId,
  companyId: String,      // WC-YYYY-XXXX (eindeutig)
  name: String,
  industry: String,
  adminId: ObjectId,      // Referenz zu User
  plan: String,           // starter, professional, enterprise
  createdAt: Date,
  updatedAt: Date
}
```

**User.js**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,          // (email + companyId mus eindeutig sein)
  password: String,       // gehasht
  role: String,           // admin, manager, hr, lead, employee, guest
  companyId: String,      // Referenz zu Company.companyId
  title: String,
  dept: String,
  status: String,         // Active, Invited, Inactive
  createdAt: Date,
  updatedAt: Date
}
```

### API-Endpoints

```
POST   /api/auth/register      # Workspace + Admin erstellen
POST   /api/auth/login         # Benutzer-Login
POST   /api/team/members       # Benutzer erstellen (nur Admin)
GET    /api/team/members       # Mitglieder auflisten (filtert nach companyId)
DELETE /api/team/members/:id   # Benutzer löschen (nur Admin)
GET    /api/company            # Info zur aktuellen Firma
PUT    /api/company            # Firma aktualisieren (nur Admin)
```

### Authentifizierungs-Middleware

Jeder Endpoint mus:
1. JWT-Token validieren
2. companyId aus dem Token extrahieren
3. Alle Daten filtern WHERE companyId = token.companyId
4. Prüfen, das der Benutzer zu dieser companyId gehört

```javascript
// Middleware-Beispiel
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, SECRET);
  req.companyId = decoded.companyId;  // ← Speichern für die Filterung
  next();
};
```

## Tests

### Manueller Ablauf
1. Auf die App zugreifen → Login-Bildschirm
2. Klick auf "Sign up"
3. Registrierung ausfüllen (2 Schritte)
4. Prüfen, das die Company ID in der Sidebar angezeigt wird
5. Zu Settings → Workspace gehen, um die Firmeninfo zu sehen
6. Zu Settings → Team Management gehen, um Mitglieder hinzuzufügen
7. Logout durchführen und prüfen, das man zum Login zurückkehrt

### Multi-Tenant-Tests
1. 2 verschiedene Workspaces erstellen (im Inkognito-Modus/anderem Browser)
2. Prüfen, das jeder eine eigene Company ID hat
3. Prüfen, das sich die Daten zwischen den Firmen nicht vermischen
4. Benutzer in jedem Workspace erstellen und prüfen, das sie nur ihre eigenen Daten sehen