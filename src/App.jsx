import { useState, useEffect } from 'react'
import { Sidebar, TopBar } from './layout'
import { TweaksPanel, TweakSection, TweakColor, TweakRadio, useTweaks } from './tweaks-panel'
import * as Pages from './pages'
import { Login, Register } from './pages/Auth'
import { EMP, NAV, ROLES, getAccess } from './data'
import './index.css'

const ACCENTS = {
  "#0d7d7d": { d:"#0a6a6a", soft:"#e4f3f2", soft2:"#d3ebea", ink:"#0a5c5c" },
  "#2563eb": { d:"#1d4ed8", soft:"#e7effd", soft2:"#d3e2fb", ink:"#1e4fb8" },
  "#4f46e5": { d:"#4338ca", soft:"#ebeafc", soft2:"#ddd9f9", ink:"#3f37b5" },
  "#0f7d57": { d:"#0c6647", soft:"#e3f4ec", soft2:"#cfeadd", ink:"#0a553b" },
};

const GUEST = { id: "guest", name: "Alex Guest", title: "External Partner", initials: "AG", color: "#6b7a8d", email: "alex@partner.com", dept: "—" };
const USER_BY_ROLE = {
  admin: EMP[0], manager: EMP[1], hr: EMP[10],
  lead: EMP[4], employee: EMP[2], guest: GUEST,
};

const TWEAK_DEFAULTS = {
  "accent": "#0d7d7d",
  "theme": "dark",
  "sidebar": "dark",
  "density": "regular"
};

const NAV_LABEL = {};
NAV.forEach(g => g.items.forEach(i => { NAV_LABEL[i.key] = i.label; }));

const PAGES = {
  dashboard: Pages.Dashboard,
  employees: Pages.Employees,
  departments: Pages.Departments,
  teams: Pages.Teams,
  projects: Pages.Projects,
  tasks: Pages.Tasks,
  schedule: Pages.Schedule,
  attendance: Pages.Attendance,
  documents: Pages.Documents,
  files: Pages.Files,
  announcements: Pages.Announcements,
  clients: Pages.Clients,
  invoices: Pages.Invoices,
  reports: Pages.Reports,
  messages: Pages.Messages,
  meetings: Pages.Meetings,
  notifications: Pages.Notifications,
  settings: Pages.Settings,
  dienstplan: Pages.Dienstplan,
  personalreglement: Pages.Personalreglement,
  vademecum: Pages.Vademecum,
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(() => location.hash.replace("#", "") || "dashboard");
  const [role, setRole] = useState("admin");
  const [collapsed, setCollapsed] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [currentUserData, setCurrentUserData] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [companyData, setCompanyData] = useState(() => {
    const stored = localStorage.getItem('company');
    return stored ? JSON.parse(stored) : null;
  });
  const [authMode, setAuthMode] = useState("login");

  const isAuthenticated = !!authToken && !!currentUserData && !!companyData;
  const currentUser = currentUserData || USER_BY_ROLE[role] || GUEST;

  // Apply tweaks to :root
  useEffect(() => {
    const root = document.documentElement;
    const a = ACCENTS[t.accent] || ACCENTS["#0d7d7d"];
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-600", t.accent);
    root.style.setProperty("--accent-700", a.d);
    root.style.setProperty("--accent-soft", a.soft);
    root.style.setProperty("--accent-soft-2", a.soft2);
    root.style.setProperty("--accent-ink", a.ink);
  }, [t.accent]);

  useEffect(() => { document.body.setAttribute("data-sidebar", t.sidebar); }, [t.sidebar]);
  useEffect(() => { document.body.setAttribute("data-density", t.density); }, [t.density]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", t.theme); }, [t.theme]);

  const [permissionRequest, setPermissionRequest] = useState(null);

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "dashboard");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleLogin = ({ token, user, company }) => {
    setAuthToken(token);
    setCurrentUserData(user);
    setCompanyData(company);
    setRoute("dashboard");
    location.hash = "dashboard";
  };

  const handleRegister = ({ token, user, company }) => {
    setAuthToken(token);
    setCurrentUserData(user);
    setCompanyData(company);
    setRoute("dashboard");
    location.hash = "dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setAuthToken(null);
    setCurrentUserData(null);
    setCompanyData(null);
    setRoute("dashboard");
    location.hash = "";
    setAuthMode("login");
  };

  const navigate = (key) => {
    setRoute(key);
    location.hash = key;
    document.querySelector(".content")?.scrollTo(0, 0);
  };

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <Login onLogin={handleLogin} />
    ) : (
      <Register onRegister={handleRegister} />
    );
  }

  const handleRequestPermission = (pageLabel, userRole) => {
    setPermissionRequest({ pageLabel, userRole, timestamp: new Date().toLocaleString() });
    setTimeout(() => setPermissionRequest(null), 4000);
  };

  const access = getAccess(role, route);
  const Page = PAGES[route] || Pages.Dashboard;

  return (
    <div className="app" data-collapsed={collapsed}>
      <Sidebar
        active={route}
        onNavigate={navigate}
        collapsed={collapsed}
        role={currentUserData?.role || role}
        currentUser={currentUser}
        company={companyData}
        onLogout={handleLogout}
      />
      <div className="main">
        <TopBar
          title={NAV_LABEL[route] || "Dashboard"}
          crumb={route === "dashboard" ? companyData?.name : "WorkCentral"}
          role={currentUserData?.role || role}
          onRole={(r) => setRole(r)}
          onToggleCollapse={() => setCollapsed(c => !c)}
          onNavigate={navigate}
          company={companyData}
          onLogout={handleLogout}
          theme={t.theme}
          onToggleTheme={() => setTweak("theme", t.theme === "dark" ? "light" : "dark")}
        />
        <div className="content">
          {access === "none"
            ? <Pages.LockedPage pageLabel={NAV_LABEL[route]} role={currentUserData?.role || role} onNavigate={navigate} onRequestPermission={handleRequestPermission} />
            : <Page
                role={currentUserData?.role || role}
                access={access}
                currentUser={currentUser}
                company={companyData}
                onNavigate={navigate}
                onOpenTweaks={() => document.querySelector(".tweaks-panel")?.classList.toggle("open")}
              />}
          {permissionRequest && (
            <div className="permission-toast">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Access Request Sent</div>
              <div style={{ opacity: 0.9, fontSize: 14 }}>Admin will review your request for {permissionRequest.pageLabel}</div>
            </div>
          )}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio
          label="Color Mode"
          value={t.theme}
          options={["dark","light"]}
          onChange={v => setTweak("theme", v)}
        />
        <TweakSection label="Brand color" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#0d7d7d","#2563eb","#4f46e5","#0f7d57"]}
          onChange={v => setTweak("accent", v)}
        />
        <TweakSection label="Sidebar" />
        <TweakRadio
          label="Style"
          value={t.sidebar}
          options={["dark","light"]}
          onChange={v => setTweak("sidebar", v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact","regular","spacious"]}
          onChange={v => setTweak("density", v)}
        />
      </TweaksPanel>
    </div>
  );
}
