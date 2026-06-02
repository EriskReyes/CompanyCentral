// Roles
export const ROLES = [
  { key: "admin",    name: "Admin",        color: "#6d54d6", desc: "Full access to everything across the workspace." },
  { key: "manager",  name: "Manager",      color: "#2f6fdb", desc: "Manages projects, teams and tasks." },
  { key: "hr",       name: "HR",           color: "#15935f", desc: "Manages employees, departments and attendance." },
  { key: "lead",     name: "Team Leader",  color: "#0d7d7d", desc: "Manages team tasks and schedules." },
  { key: "employee", name: "Employee",     color: "#c2790a", desc: "Sees own tasks, schedule, documents and messages." },
  { key: "guest",    name: "Guest",        color: "#6b7a8d", desc: "Limited access to shared and public information." },
];

// Navigation
export const NAV = [
  { group: "Overview", items: [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  ]},
  { group: "People", items: [
    { key: "employees", label: "Employees", icon: "employees" },
    { key: "departments", label: "Departments", icon: "departments" },
    { key: "teams", label: "Teams", icon: "teams" },
  ]},
  { group: "Work", items: [
    { key: "projects", label: "Projects", icon: "projects" },
    { key: "tasks", label: "Tasks", icon: "tasks", badge: "5" },
    { key: "schedule", label: "Schedule", icon: "schedule" },
    { key: "attendance", label: "Attendance", icon: "attendance" },
  ]},
  { group: "Resources", items: [
    { key: "documents", label: "Documents", icon: "documents" },
    { key: "files", label: "Files", icon: "files" },
    { key: "announcements", label: "Announcements", icon: "announcements" },
  ]},
  { group: "Business", items: [
    { key: "clients", label: "Clients", icon: "clients" },
    { key: "invoices", label: "Invoices", icon: "invoices" },
    { key: "reports", label: "Reports", icon: "reports" },
  ]},
  { group: "Connect", items: [
    { key: "messages", label: "Messages", icon: "messages", badge: "3" },
    { key: "meetings", label: "Meetings", icon: "meetings" },
    { key: "notifications", label: "Notifications", icon: "notifications", badge: "8" },
  ]},
  { group: "System", items: [
    { key: "settings", label: "Settings", icon: "settings" },
  ]},
];

// Access map
const ACCESS = {
  dashboard:     { full: ["admin","manager","hr","lead","employee"], view: ["guest"] },
  employees:     { full: ["admin","hr"], view: ["manager","lead"] },
  departments:   { full: ["admin","hr"], view: ["manager","lead"] },
  teams:         { full: ["admin","manager","lead"], view: ["hr"] },
  projects:      { full: ["admin","manager"], view: ["lead","employee"] },
  tasks:         { full: ["admin","manager","lead","employee"], view: [] },
  schedule:      { full: ["admin","manager","lead","employee","hr"], view: [] },
  attendance:    { full: ["admin","hr"], view: ["manager","lead"] },
  documents:     { full: ["admin","hr","manager","lead"], view: ["employee","guest"] },
  files:         { full: ["admin","manager","hr","lead"], view: ["employee"] },
  announcements: { full: ["admin","hr"], view: ["manager","lead","employee","guest"] },
  clients:       { full: ["admin","manager"], view: ["lead"] },
  invoices:      { full: ["admin"], view: [] },
  reports:       { full: ["admin"], view: ["manager","hr"] },
  messages:      { full: ["admin","manager","hr","lead","employee"], view: [] },
  meetings:      { full: ["admin","manager","hr","lead","employee"], view: ["guest"] },
  notifications: { full: ["admin","manager","hr","lead","employee"], view: ["guest"] },
  settings:      { full: ["admin","manager","hr","lead","employee"], view: ["guest"] },
};

export function getAccess(role, key) {
  const a = ACCESS[key];
  if (!a) return "none";
  if (a.full.includes(role)) return "full";
  if (a.view.includes(role)) return "view";
  return "none";
}

// Employees
const AV = ["#2f6fdb","#0d7d7d","#6d54d6","#c2790a","#15935f","#d4453e","#0ea5b7","#7c6f3a","#b3543f","#4f6d8e"];
function emp(id, name, title, dept, team, status, type, loc, joined, ci) {
  const parts = name.split(" ");
  return { id, name, title, dept, team, status, type, loc, joined,
    initials: (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase(),
    color: AV[ci % AV.length],
    email: name.toLowerCase().replace(/[^a-z ]/g,"").replace(/ +/g,".") + "@workcentral.io" };
}

export const EMP = [
  emp("E-101","Dana Whitfield","VP Engineering","Engineering","Platform","Active","Full-time","San Francisco","Mar 2021",0),
  emp("E-102","Marcus Lindell","Engineering Manager","Engineering","Web","Active","Full-time","San Francisco","Jun 2021",1),
  emp("E-103","Priya Raman","Senior Frontend Engineer","Engineering","Web","Active","Full-time","Austin","Sep 2021",2),
  emp("E-104","Tomás Herrera","Backend Engineer","Engineering","Platform","Remote","Full-time","Mexico City","Jan 2022",3),
  emp("E-105","Yuki Tanaka","Mobile Engineer","Engineering","Mobile","Active","Full-time","Seattle","Apr 2022",4),
  emp("E-106","Naomi Clarke","Data Engineer","Engineering","Data","On leave","Full-time","Remote","Nov 2021",5),
  emp("E-107","Elena Petrova","Head of Product","Product","—","Active","Full-time","San Francisco","Feb 2021",6),
  emp("E-108","Jordan Mbeki","Product Manager","Product","—","Active","Full-time","London","Aug 2022",7),
  emp("E-109","Sofia Marchetti","Lead Designer","Design","—","Active","Full-time","Milan","May 2021",8),
  emp("E-110","Aaron Cole","Product Designer","Design","—","Remote","Contract","Toronto","Mar 2023",9),
  emp("E-111","Hannah Berg","Head of People","People Ops","—","Active","Full-time","San Francisco","Jan 2021",0),
  emp("E-112","Olu Adeyemi","People Operations","People Ops","—","Active","Full-time","Lagos","Oct 2022",1),
  emp("E-113","Grace Sullivan","Account Executive","Sales","—","Active","Full-time","New York","Jul 2021",2),
  emp("E-114","Daniel Reyes","Sales Lead","Sales","—","Active","Full-time","New York","Mar 2021",3),
  emp("E-115","Mei Chen","Customer Success Manager","Customer Success","—","Active","Full-time","Singapore","Sep 2022",4),
  emp("E-116","Lukas Novak","Finance Analyst","Finance","—","Active","Full-time","Berlin","Feb 2022",5),
  emp("E-117","Ava Robinson","QA Engineer","Engineering","Mobile","Active","Full-time","Austin","Jun 2023",6),
  emp("E-118","Felix Wagner","DevOps Engineer","Engineering","Platform","Remote","Full-time","Remote","Apr 2023",7),
];

export const empById = Object.fromEntries(EMP.map(e => [e.id, e]));

// Departments
export const DEPT = [
  { name: "Engineering", lead: "E-101", count: 8, color: "#2f6fdb", open: 3 },
  { name: "Product", lead: "E-107", count: 2, color: "#6d54d6", open: 1 },
  { name: "Design", lead: "E-109", count: 2, color: "#0d7d7d", open: 1 },
  { name: "People Ops", lead: "E-111", count: 2, color: "#15935f", open: 0 },
  { name: "Sales", lead: "E-114", count: 2, color: "#c2790a", open: 2 },
  { name: "Customer Success", lead: "E-115", count: 1, color: "#0ea5b7", open: 1 },
  { name: "Finance", lead: "E-116", count: 1, color: "#b3543f", open: 0 },
];

// Teams
export const TEAMS = [
  { name: "Platform", dept: "Engineering", lead: "E-101", members: ["E-101","E-104","E-118"], focus: "Core services & infra" },
  { name: "Web", dept: "Engineering", lead: "E-102", members: ["E-102","E-103"], focus: "Customer-facing web app" },
  { name: "Mobile", dept: "Engineering", lead: "E-105", members: ["E-105","E-117"], focus: "iOS & Android apps" },
  { name: "Data", dept: "Engineering", lead: "E-106", members: ["E-106"], focus: "Pipelines & analytics" },
];

// Projects
export const PROJ = [
  { id:"PRJ-01", name:"Atlas Platform Migration", code:"ATLAS", status:"On track", progress:72, lead:"E-101", team:"Platform", members:["E-101","E-104","E-118","E-102"], due:"Jul 18, 2026", priority:"High", done:34, total:47, client:null },
  { id:"PRJ-02", name:"Mobile App v3.0", code:"MOB3", status:"At risk", progress:48, lead:"E-105", team:"Mobile", members:["E-105","E-117","E-110"], due:"Jun 30, 2026", priority:"Urgent", done:19, total:40, client:"Northwind" },
  { id:"PRJ-03", name:"Billing & Invoicing Revamp", code:"BILL", status:"On track", progress:61, lead:"E-102", team:"Web", members:["E-102","E-103","E-116"], due:"Aug 05, 2026", priority:"High", done:22, total:36, client:null },
  { id:"PRJ-04", name:"Design System 2.0", code:"DS2", status:"On track", progress:84, lead:"E-109", team:"Design", members:["E-109","E-110","E-103"], due:"Jun 25, 2026", priority:"Medium", done:38, total:45, client:null },
  { id:"PRJ-05", name:"Data Warehouse Rollout", code:"DWH", status:"Delayed", progress:33, lead:"E-106", team:"Data", members:["E-106","E-104"], due:"Sep 12, 2026", priority:"Medium", done:11, total:33, client:null },
  { id:"PRJ-06", name:"Customer Portal", code:"PORTAL", status:"On track", progress:55, lead:"E-108", team:"Web", members:["E-108","E-103","E-110"], due:"Aug 22, 2026", priority:"High", done:20, total:38, client:"Meridian Health" },
  { id:"PRJ-07", name:"API Gateway Hardening", code:"APIGW", status:"Completed", progress:100, lead:"E-118", team:"Platform", members:["E-118","E-104"], due:"May 30, 2026", priority:"High", done:28, total:28, client:null },
  { id:"PRJ-08", name:"Onboarding Flow Redesign", code:"ONB", status:"Planning", progress:12, lead:"E-108", team:"Web", members:["E-108","E-109","E-103"], due:"Oct 03, 2026", priority:"Low", done:4, total:30, client:null },
];

export const projById = Object.fromEntries(PROJ.map(p => [p.id, p]));

// Tasks
function tk(id, title, proj, assignee, status, priority, due, tags) {
  return { id, title, proj, assignee, status, priority, due, tags };
}
export const TASKS = [
  tk("T-2401","Migrate auth service to Atlas cluster","PRJ-01","E-104","In progress","High","Jun 04",["backend","infra"]),
  tk("T-2402","Resolve push notification crash on Android 14","PRJ-02","E-117","Blocked","Urgent","Jun 03",["mobile","bug"]),
  tk("T-2403","Build invoice line-item editor","PRJ-03","E-103","In progress","High","Jun 06",["frontend"]),
  tk("T-2404","Finalize color token migration","PRJ-04","E-110","In review","Medium","Jun 05",["design"]),
  tk("T-2405","Set up nightly warehouse sync job","PRJ-05","E-106","Todo","Medium","Jun 09",["data"]),
  tk("T-2406","Portal SSO integration spec","PRJ-06","E-108","In progress","High","Jun 05",["product"]),
  tk("T-2407","Write E2E tests for checkout","PRJ-03","E-117","Todo","Medium","Jun 07",["qa"]),
  tk("T-2408","Rate-limit middleware rollout","PRJ-01","E-118","Done","High","May 29",["infra"]),
  tk("T-2409","Redesign empty states","PRJ-08","E-109","Todo","Low","Jun 12",["design"]),
  tk("T-2410","Offline mode for mobile app","PRJ-02","E-105","In progress","Urgent","Jun 06",["mobile"]),
  tk("T-2411","Data model review for billing","PRJ-03","E-102","In review","Medium","Jun 04",["backend"]),
  tk("T-2412","Accessibility audit — web app","PRJ-04","E-103","Todo","Medium","Jun 10",["a11y","frontend"]),
  tk("T-2413","Document gateway deprecations","PRJ-07","E-118","Done","Low","May 28",["docs"]),
  tk("T-2414","Customer import CSV parser","PRJ-06","E-103","In progress","Medium","Jun 08",["frontend"]),
  tk("T-2415","Define onboarding success metrics","PRJ-08","E-108","Todo","Low","Jun 13",["product"]),
];

// Documents
function doc(id, name, kind, owner, dept, updated, size, shared) {
  return { id, name, kind, owner, dept, updated, size, shared };
}
export const DOCS = [
  doc("D-01","Q3 Engineering Roadmap","DOC","E-101","Engineering","2h ago","1.2 MB",false),
  doc("D-02","Employee Handbook 2026","PDF","E-111","People Ops","Yesterday","4.8 MB",true),
  doc("D-03","Atlas Architecture Spec","DOC","E-104","Engineering","Yesterday","860 KB",false),
  doc("D-04","Mobile v3 PRD","DOC","E-108","Product","2d ago","720 KB",false),
  doc("D-05","Design System Guidelines","FIG","E-109","Design","2d ago","—",true),
  doc("D-06","Brand Assets & Logos","ZIP","E-109","Design","3d ago","22 MB",true),
  doc("D-07","Security & Compliance Policy","PDF","E-118","Engineering","4d ago","2.1 MB",true),
  doc("D-08","Onboarding Checklist","SHEET","E-112","People Ops","5d ago","210 KB",true),
  doc("D-09","Customer Portal Wireframes","FIG","E-110","Design","5d ago","—",false),
  doc("D-10","Billing Data Model","SHEET","E-116","Finance","1w ago","430 KB",false),
  doc("D-11","API Gateway Postmortem","DOC","E-118","Engineering","1w ago","540 KB",false),
  doc("D-12","2026 Company OKRs","SHEET","E-107","Product","1w ago","380 KB",true),
];

export const DOC_COLORS = { PDF:["#fbe7e6","#a8312b"], DOC:["#e6effb","#235ab3"], SHEET:["#e3f4ec","#0d6b44"], FIG:["#ece8fa","#523fb0"], ZIP:["#fbf0db","#95590a"] };

// Clients
export const CLIENTS = [
  { id:"C-01", name:"Northwind Trading", industry:"Logistics", contact:"Karen Doyle", status:"Active", since:"2023", projects:2, health:"Good", mrr:"$18,400", color:"#2f6fdb" },
  { id:"C-02", name:"Meridian Health", industry:"Healthcare", contact:"Dr. Alan Pierce", status:"Active", since:"2022", projects:1, health:"At risk", mrr:"$26,900", color:"#0d7d7d" },
  { id:"C-03", name:"Bluepeak Capital", industry:"Finance", contact:"Sandra Mwangi", status:"Active", since:"2024", projects:1, health:"Good", mrr:"$31,200", color:"#6d54d6" },
  { id:"C-04", name:"Vertex Robotics", industry:"Manufacturing", contact:"Hiro Sato", status:"Prospect", since:"—", projects:0, health:"New", mrr:"—", color:"#c2790a" },
  { id:"C-05", name:"Calla Retail Group", industry:"Retail", contact:"Mara Lindqvist", status:"Active", since:"2021", projects:3, health:"Excellent", mrr:"$42,750", color:"#15935f" },
  { id:"C-06", name:"Orbit Media", industry:"Media", contact:"James Okoro", status:"Churned", since:"2020", projects:0, health:"Lost", mrr:"—", color:"#6b7a8d" },
  { id:"C-07", name:"Solano Energy", industry:"Energy", contact:"Patricia Vega", status:"Prospect", since:"—", projects:0, health:"New", mrr:"—", color:"#0ea5b7" },
];

// Invoices
export const INVOICES = [
  { id:"INV-2041", client:"Calla Retail Group", amount:"$42,750", status:"Paid", issued:"May 01", due:"May 31" },
  { id:"INV-2042", client:"Bluepeak Capital", amount:"$31,200", status:"Paid", issued:"May 03", due:"Jun 02" },
  { id:"INV-2043", client:"Meridian Health", amount:"$26,900", status:"Pending", issued:"May 18", due:"Jun 17" },
  { id:"INV-2044", client:"Northwind Trading", amount:"$18,400", status:"Overdue", issued:"Apr 20", due:"May 20" },
  { id:"INV-2045", client:"Calla Retail Group", amount:"$12,300", status:"Pending", issued:"May 24", due:"Jun 23" },
  { id:"INV-2046", client:"Vertex Robotics", amount:"$8,500", status:"Draft", issued:"—", due:"—" },
];

// Announcements
export const ANNOUNCE = [
  { id:"A-1", title:"Company All-Hands — June 12", author:"E-111", dept:"People Ops", time:"2h ago", pinned:true, body:"Join us Friday at 10am PT for the quarterly all-hands. We'll cover roadmap progress, new hires, and Q3 goals." },
  { id:"A-2", title:"New hires this week 👋", author:"E-112", dept:"People Ops", time:"Yesterday", pinned:false, body:"Please welcome Felix and Ava to the Engineering team. Say hi in #welcome!" },
  { id:"A-3", title:"Atlas migration freeze: Jun 16–18", author:"E-101", dept:"Engineering", time:"2d ago", pinned:false, body:"A short deploy freeze is scheduled during the Atlas cutover. Plan releases accordingly." },
  { id:"A-4", title:"Updated security policy is live", author:"E-118", dept:"Engineering", time:"4d ago", pinned:false, body:"All employees must complete the updated security training by end of month." },
];

// Meetings
export const MEETINGS = [
  { title:"Atlas migration sync", time:"Today · 11:00", who:["E-101","E-104","E-118"], room:"Zoom" },
  { title:"1:1 — Priya Raman", time:"Today · 14:00", who:["E-102","E-103"], room:"Meet" },
  { title:"Sprint planning", time:"Tomorrow · 09:30", who:["E-108","E-103","E-105"], room:"Room A" },
  { title:"Client call — Northwind", time:"Wed · 10:30", who:["E-113","E-115"], room:"Zoom" },
];

// Activity
export const ACTIVITY = [
  { who:"E-103", action:"completed task", target:"Build invoice line-item editor", time:"12m ago" },
  { who:"E-118", action:"merged PR in", target:"Atlas Platform Migration", time:"38m ago" },
  { who:"E-109", action:"shared", target:"Design System Guidelines", time:"1h ago" },
  { who:"E-108", action:"created project", target:"Onboarding Flow Redesign", time:"2h ago" },
  { who:"E-117", action:"reported a blocker on", target:"Mobile App v3.0", time:"3h ago" },
  { who:"E-111", action:"posted an announcement", target:"Company All-Hands", time:"4h ago" },
  { who:"E-105", action:"updated status of", target:"Offline mode for mobile app", time:"5h ago" },
];

// Notifications
export const NOTIFS = [
  { who:"E-102", text:'assigned you to "Data model review for billing"', time:"9m ago", kind:"task", unread:true },
  { who:"E-117", text:'commented on "Push notification crash"', time:"25m ago", kind:"comment", unread:true },
  { who:"E-111", text:"posted: Company All-Hands — June 12", time:"2h ago", kind:"announce", unread:true },
  { who:"E-104", text:"requested your review on a pull request", time:"3h ago", kind:"review", unread:false },
  { who:"E-109", text:'shared "Design System Guidelines" with you', time:"5h ago", kind:"doc", unread:false },
];

// Reports
export const REPORTS = {
  weekly: [ {d:"Mon",v:42},{d:"Tue",v:55},{d:"Wed",v:48},{d:"Thu",v:61},{d:"Fri",v:53},{d:"Sat",v:14},{d:"Sun",v:9} ],
  taskStatus: [ {label:"Done",val:124,color:"#15935f"},{label:"In progress",val:48,color:"#2f6fdb"},{label:"In review",val:21,color:"#6d54d6"},{label:"Todo",val:63,color:"#93a1b0"},{label:"Blocked",val:7,color:"#d4453e"} ],
  revenue: [ {d:"Jan",v:188},{d:"Feb",v:204},{d:"Mar",v:221},{d:"Apr",v:236},{d:"May",v:262},{d:"Jun",v:278} ],
  headcount: [ {d:"Q1",v:38},{d:"Q2",v:44},{d:"Q3",v:51},{d:"Q4",v:58} ],
};

// Schedule
export const SCHEDULE = [
  { who:"E-101", type:"meeting", title:"Team standup", day:1, start:9, len:1 },
  { who:"E-102", type:"focus", title:"Design system update", day:1, start:10, len:2 },
  { who:"E-103", type:"review", title:"Code review", day:1, start:14, len:1.5 },
  { who:"E-101", type:"meeting", title:"Client presentation", day:2, start:10, len:1 },
  { who:"E-105", type:"client", title:"Q2 Planning", day:2, start:14, len:2 },
  { who:"E-104", type:"interview", title:"Candidate interview", day:2, start:16, len:1 },
  { who:"E-102", type:"meeting", title:"Design sync", day:3, start:9.5, len:1 },
  { who:"E-101", type:"focus", title:"Spec writing", day:3, start:11, len:3 },
  { who:"E-106", type:"meeting", title:"Team standup", day:3, start:9, len:1 },
  { who:"E-103", type:"review", title:"Architecture review", day:4, start:13, len:2 },
  { who:"E-104", type:"focus", title:"Feature development", day:4, start:9, len:4 },
  { who:"E-107", type:"client", title:"Support call", day:4, start:15, len:1 },
  { who:"E-101", type:"meeting", title:"Weekly planning", day:5, start:10, len:1.5 },
  { who:"E-108", type:"interview", title:"Team interview", day:5, start:14, len:1 },
  { who:"E-102", type:"focus", title:"Design iteration", day:5, start:11, len:2 },
];

// Messages/Threads
export const THREADS = [
  { id:"E-102", last:"Sounds good — let's sync after standup.", time:"09:24", unread:2, online:true,
    msgs:[["E-102","Morning! Did you get a chance to look at the billing data model?","09:02"],["me","Yes, reviewing now. A couple of edge cases on tax lines.","09:18"],["E-102","Sounds good — let's sync after standup.","09:24"]] },
  { id:"E-109", last:"Pushed the new color tokens 🎨", time:"Yesterday", unread:0, online:true,
    msgs:[["E-109","Pushed the new color tokens 🎨","16:40"],["me","Amazing, I'll wire them into the web app today.","16:52"]] },
  { id:"E-108", last:"Can you join the portal SSO call?", time:"Yesterday", unread:1, online:false,
    msgs:[["E-108","Can you join the portal SSO call?","14:10"]] },
  { id:"E-117", last:"The crash repro is in the ticket.", time:"Mon", unread:0, online:false,
    msgs:[["E-117","The crash repro is in the ticket.","11:30"],["me","Thanks, taking a look.","11:45"]] },
  { id:"E-101", last:"Great work on the migration plan.", time:"Mon", unread:0, online:true,
    msgs:[["E-101","Great work on the migration plan.","10:05"]] },
];
