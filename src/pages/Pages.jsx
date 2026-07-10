// CAMBIOS: todos los componentes aceptan prop isDemo — datos vacios para empresas reales, datos demo solo con token 'dev-mock-token'
// Komponenten aktualisiert: Documents, Files, Announcements, Clients, Invoices, Reports, Messages, Meetings, Notifications, Schedule
import React, { useState, useRef } from 'react';
import { API_URL } from '../config'; // Zentrale Backend-URL für alle API-Aufrufe
import { Icon } from '../icons';
import { Card, Btn, Badge, StatusBadge, Priority, Progress, Avatar, AvatarStack, Person, Search, Select, Seg, Tabs, PageHead, EmptyState, BarChart, Donut, showToast } from '../ui';
import * as D from '../data';

// ========== PROJECTS ==========
export function Projects({ access, isDemo }) {
  const [projects, setProjects] = useState(isDemo ? D.PROJ : []);
  const [view, setView] = useState("List");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", code: "", priority: "Medium", due: "" });
  
  const canManage = access === "full";
  const list = projects.filter(p => (status === "All" || p.status === status) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase())));
  const cols = ["Planning","On track","At risk","Delayed","Completed"];

  const handleAddProject = () => {
    if (!newProject.name || !newProject.code) return;
    const proj = {
      id: "PRJ-" + (10 + projects.length),
      name: newProject.name,
      code: newProject.code.toUpperCase(),
      status: "Planning",
      progress: 0,
      lead: "E-101",
      team: "Platform",
      members: ["E-101"],
      due: newProject.due || "TBD",
      priority: newProject.priority,
      done: 0,
      total: 0,
      client: null
    };
    setProjects([proj, ...projects]);
    setNewProject({ name: "", code: "", priority: "Medium", due: "" });
    setShowAdd(false);
    showToast(`Project "${proj.name}" created successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Projects" sub={`${projects.filter(p=>p.status!=="Completed").length} active · ${projects.length} total`}
        actions={<><Seg options={["List","Board"]} value={view} onChange={setView} />
          {canManage ? <Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New project"}</Btn> : <Badge tone="gray" dot>Read-only</Badge>}
        </>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Project Name</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Website Redesign" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Project Code</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. WEB2" value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Priority</label>
              <select className="input" style={{ width: "100%" }} value={newProject.priority} onChange={e => setNewProject({...newProject, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="fieldlabel">Due Date</label>
              <input type="date" className="input" style={{ width: "100%" }} value={newProject.due} onChange={e => setNewProject({...newProject, due: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddProject}>Create Project</Btn>
          </div>
        </Card>
      )}

      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search projects…" value={q} onChange={setQ} />
        <Select value={status} options={["All","Planning","On track","At risk","Delayed","Completed"]} onChange={setStatus} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize: 14.5 }}>{list.length} projects</span>
      </div>
      {view === "List" ? (
        <Card flush>
          <div style={{ overflowX:"auto" }}>
            <table className="table">
              <thead><tr>
                <th>Project</th><th>Lead</th><th>Team</th><th>Members</th><th style={{ width:170 }}>Progress</th><th>Priority</th><th>Due</th><th>Status</th>
              </tr></thead>
              <tbody>
                {list.map(p => (<tr key={p.id} className="clickable">
                  <td><div style={{ display:"flex", alignItems:"center", gap:11 }}>
                    <div className="tile-ico" style={{ background:"var(--surface-2)", border:"1px solid var(--line)", fontFamily:"var(--mono)", fontSize: 12, fontWeight:700, color:"var(--accent-ink)", width:34, height:34 }}>{p.code.slice(0,3)}</div>
                    <div style={{ minWidth:0 }}><div className="t-strong" style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:230 }}>{p.name}</div><div className="muted" style={{ fontSize: 13.5 }}>{p.id}{p.client && " · "+p.client}</div></div>
                  </div></td>
                  <td><Avatar id={p.lead} size={28} /></td>
                  <td>{p.team}</td>
                  <td><AvatarStack ids={p.members} size={26} max={3} /></td>
                  <td><div style={{ display:"flex", alignItems:"center", gap:9 }}><div style={{ flex:1 }}><Progress value={p.progress} thin /></div><span className="mono" style={{ fontSize: 14, fontWeight:600, width:34, textAlign:"right" }}>{p.progress}%</span></div></td>
                  <td><Priority value={p.priority} /></td>
                  <td className="t-mono" style={{ fontSize: 14.5 }}>{p.due}</td>
                  <td><StatusBadge value={p.status} /></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length},1fr)`, gap:14, alignItems:"start" }}>
          {cols.map(col => {
            const items = list.filter(p => p.status === col);
            return (<div key={col} style={{ background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:"var(--r-lg)", padding:10, minHeight:120 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 6px 10px" }}>
                <StatusBadge value={col} />
                <span className="muted mono" style={{ fontSize: 14, marginLeft:"auto" }}>{items.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {items.map(p => (<div key={p.id} className="card" style={{ padding:13, boxShadow:"var(--sh-xs)", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight:700, color:"var(--accent-ink)" }}>{p.code}</span>
                    <Priority value={p.priority} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight:600, marginBottom:10, lineHeight:1.3 }}>{p.name}</div>
                  <Progress value={p.progress} thin />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:11 }}>
                    <AvatarStack ids={p.members} size={24} max={3} />
                    <span className="muted" style={{ fontSize: 13 }}>{p.due}</span>
                  </div>
                </div>))}
              </div>
            </div>);
          })}
        </div>
      )}
    </div>
  );
}

// ========== TASKS ==========
export function Tasks({ access, role, currentUser, isDemo }) {
  const [tasks, setTasks] = useState(isDemo ? D.TASKS : []);
  const [view, setView] = useState("Board");
  const [proj, setProj] = useState("All projects");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", proj: "PRJ-01", assignee: currentUser.id, priority: "Medium", due: "" });

  const personal = access !== "full" || role === "employee";
  const projOpts = ["All projects", ...D.PROJ.map(p => p.name)];
  let base = tasks;
  if (personal) base = base.filter(t => t.assignee === currentUser.id);
  const list = base.filter(t => proj === "All projects" || D.projById[t.proj]?.name === proj);
  const cols = ["Todo","In progress","In review","Blocked","Done"];

  const handleAddTask = () => {
    if (!newTask.title) return;
    const task = {
      id: "T-" + (2400 + tasks.length + 1),
      title: newTask.title,
      proj: newTask.proj,
      assignee: newTask.assignee,
      status: "Todo",
      priority: newTask.priority,
      due: newTask.due || "TBD",
      tags: []
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: "", proj: "PRJ-01", assignee: currentUser.id, priority: "Medium", due: "" });
    setShowAdd(false);
    showToast(`Task "${task.title}" created successfully`);
  };

  return (
    <div className="page">
      <PageHead title={personal ? "My Tasks" : "Tasks"} sub={personal ? "Tasks assigned to you" : `${tasks.length} tasks across all projects`}
        actions={<><Seg options={["Board","List"]} value={view} onChange={setView} />
          <Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New task"}</Btn>
        </>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Task Title</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Update user profile design" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Project</label>
              <select className="input" style={{ width: "100%" }} value={newTask.proj} onChange={e => setNewTask({...newTask, proj: e.target.value})}>
                {D.PROJ.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Assignee</label>
              <select className="input" style={{ width: "100%" }} value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                {D.EMP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="fieldlabel">Priority</label>
              <select className="input" style={{ width: "100%" }} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="fieldlabel">Due Date</label>
              <input type="text" className="input" style={{ width: "100%" }} placeholder="e.g. Jun 15" value={newTask.due} onChange={e => setNewTask({...newTask, due: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddTask}>Create Task</Btn>
          </div>
        </Card>
      )}

      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Select value={proj} options={projOpts} onChange={setProj} />
        {personal && <Badge tone="teal" dot>Showing your tasks</Badge>}
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize: 14.5 }}>{list.length} tasks</span>
      </div>
      {view === "Board" ? (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length},1fr)`, gap:14, alignItems:"start" }}>
          {cols.map(col => {
            const items = list.filter(t => t.status === col);
            return (<div key={col} style={{ background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:"var(--r-lg)", padding:10, minHeight:140 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 6px 10px" }}>
                <StatusBadge value={col} dot /><span className="muted mono" style={{ fontSize: 14, marginLeft:"auto" }}>{items.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {items.map(t => (<div key={t.id} className="card" style={{ padding:12, boxShadow:"var(--sh-xs)", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span className="mono" style={{ fontSize: 12, color:"var(--muted)" }}>{t.id}</span>
                    <Priority value={t.priority} />
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight:500, lineHeight:1.4, marginBottom:10 }}>{t.title}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                    {t.tags.map(tg => <span key={tg} className="tag-soft">{tg}</span>)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span className="mono muted" style={{ fontSize: 12.5 }}>{D.projById[t.proj]?.code}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="muted" style={{ fontSize: 13 }}>{t.due}</span>
                      <Avatar id={t.assignee} size={22} />
                    </div>
                  </div>
                </div>))}
                {items.length === 0 && <div style={{ padding:"16px 6px", textAlign:"center", color:"var(--muted)", fontSize: 14 }}>No tasks</div>}
              </div>
            </div>);
          })}
        </div>
      ) : (
        <Card flush>
          <table className="table">
            <thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Tags</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(t => (<tr key={t.id} className="clickable">
                <td><div className="t-strong">{t.title}</div><div className="muted mono" style={{ fontSize: 13 }}>{t.id}</div></td>
                <td>{D.projById[t.proj]?.code}</td>
                <td><Avatar id={t.assignee} size={26} /></td>
                <td><div style={{ display:"flex", gap:5 }}>{t.tags.map(tg => <span key={tg} className="tag-soft">{tg}</span>)}</div></td>
                <td><Priority value={t.priority} /></td>
                <td className="t-mono" style={{ fontSize: 14.5 }}>{t.due}</td>
                <td><StatusBadge value={t.status} /></td>
              </tr>))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ========== EMPLOYEES ==========
const EMPTY_EMP = {
  firstName:"", lastName:"", email:"", phone:"",
  title:"", dept:"Engineering", team:"", role:"employee", empType:"Full-time", startDate:"", location:"",
  address:{ street:"", city:"", state:"", zip:"", country:"" },
  emergencyName:"", emergencyPhone:"", emergencyRelation:"",
  notes:"",
};

export function Employees({ company, isDemo }) {
  const [employees, setEmployees] = useState([]);

  React.useEffect(() => {
    if (isDemo) { setEmployees(D.EMP); return; }
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/team/members`, { headers: { Authorization: `Bearer ${token}` } }) // Mitarbeiterliste laden
      .then(r => r.ok ? r.json() : [])
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isDemo]);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState(EMPTY_EMP);
  const [formSection, setFormSection] = useState("personal");
  const [createdCreds, setCreatedCreds] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState(null); // {id, code}

  const deptOpts = ["All", ...D.DEPT.map(d => d.name)];
  const list = employees.filter(e =>
    (dept === "All" || e.dept === dept) &&
    (q === "" || e.name?.toLowerCase().includes(q.toLowerCase()) || e.email?.toLowerCase().includes(q.toLowerCase()))
  );

  const set = (field, val) => setNewEmp(p => ({ ...p, [field]: val }));
  const setAddr = (field, val) => setNewEmp(p => ({ ...p, address: { ...p.address, [field]: val } }));

  const handleAddEmployee = async () => {
    if (!newEmp.firstName || !newEmp.email) {
      showToast("First name and email are required", "error"); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/team/members`, { // Neuen Mitarbeiter anlegen
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newEmp),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create employee");

      setEmployees(prev => [{
        id: data.id, name: data.name,
        title: data.title, dept: data.dept, team: data.team || "—",
        status: data.status, type: data.empType,
        email: data.email, initials: data.initials, color: data.color,
        employeeCode: data.employeeCode,
      }, ...prev]);

      setCreatedCreds({ employeeCode: data.employeeCode, tempPassword: data.tempPassword, name: data.name });
      setNewEmp(EMPTY_EMP);
      setShowAdd(false);
      setFormSection("personal");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCode = async (id, newCode) => {
    if (!newCode.trim()) return;
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_URL}/api/team/members/${id}/code`, { // Mitarbeitercode aktualisieren
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ employeeCode: newCode }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, "error"); return; }
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, employeeCode: data.employeeCode } : e));
    setEditingCode(null);
    showToast("Employee code updated");
  };

  const SECTIONS = ["personal","address","employment","emergency"];
  const SECTION_LABELS = { personal:"Personal", address:"Address", employment:"Employment", emergency:"Emergency" };

  return (
    <div className="page">
      <PageHead title="Employees" sub={`${employees.length} team members`}
        actions={<Btn variant="primary" icon="plus" onClick={() => { setShowAdd(!showAdd); setCreatedCreds(null); }}>{showAdd ? "Cancel" : "Add employee"}</Btn>} />

      {/* Credentials card — shown once after creation */}
      {createdCreds && (
        <Card style={{ marginBottom: 20, border: "1.5px solid var(--green)", background:"var(--surface)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:99, background:"var(--green-soft)", display:"grid", placeItems:"center", color:"var(--green)", fontSize:18 }}>✓</div>
            <div style={{ fontWeight:700, fontSize:17 }}>{createdCreds.name} created successfully</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, padding:"16px", background:"var(--surface-2)", borderRadius:"var(--r-lg)", marginBottom:14 }}>
            <div>
              <div className="fieldlabel">Company ID</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:17, fontWeight:700, color:"var(--accent)", letterSpacing:".04em" }}>{company?.companyId || "—"}</div>
            </div>
            <div>
              <div className="fieldlabel">Employee Code</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:17, fontWeight:700, color:"var(--ink)", letterSpacing:".04em" }}>{createdCreds.employeeCode}</div>
            </div>
            <div>
              <div className="fieldlabel">Temporary Password</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:17, fontWeight:700, color:"var(--ink)", letterSpacing:".04em" }}>{createdCreds.tempPassword}</div>
            </div>
          </div>
          <div style={{ fontSize:13.5, color:"var(--muted)", marginBottom:12 }}>
            Share these credentials with the employee. They log in with: <strong>Employee Code tab</strong> → Company ID + Employee Code + Temporary Password.
          </div>
          <Btn variant="ghost" sm onClick={() => setCreatedCreds(null)}>Dismiss</Btn>
        </Card>
      )}

      {/* Add employee form — sectioned */}
      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          {/* Section tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:20, borderBottom:"1px solid var(--line-2)", paddingBottom:14 }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setFormSection(s)} type="button"
                style={{ padding:"6px 14px", borderRadius:"var(--r-md)", border:"none", cursor:"pointer",
                  background: formSection===s ? "var(--accent)" : "var(--surface-2)",
                  color: formSection===s ? "#fff" : "var(--ink-2)",
                  fontWeight: formSection===s ? 700 : 500, fontSize:14 }}>
                {SECTION_LABELS[s]}
              </button>
            ))}
          </div>

          {formSection === "personal" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div><label className="fieldlabel">First Name *</label>
                <input className="input" style={{ width:"100%" }} placeholder="John" value={newEmp.firstName} onChange={e => set("firstName", e.target.value)} /></div>
              <div><label className="fieldlabel">Last Name</label>
                <input className="input" style={{ width:"100%" }} placeholder="Doe" value={newEmp.lastName} onChange={e => set("lastName", e.target.value)} /></div>
              <div><label className="fieldlabel">Email *</label>
                <input className="input" type="email" style={{ width:"100%" }} placeholder="john@company.com" value={newEmp.email} onChange={e => set("email", e.target.value)} /></div>
              <div><label className="fieldlabel">Phone</label>
                <input className="input" style={{ width:"100%" }} placeholder="+1 555 000 0000" value={newEmp.phone} onChange={e => set("phone", e.target.value)} /></div>
            </div>
          )}

          {formSection === "address" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1" }}><label className="fieldlabel">Street Address</label>
                <input className="input" style={{ width:"100%" }} placeholder="123 Main St" value={newEmp.address.street} onChange={e => setAddr("street", e.target.value)} /></div>
              <div><label className="fieldlabel">City</label>
                <input className="input" style={{ width:"100%" }} placeholder="New York" value={newEmp.address.city} onChange={e => setAddr("city", e.target.value)} /></div>
              <div><label className="fieldlabel">State / Province</label>
                <input className="input" style={{ width:"100%" }} placeholder="NY" value={newEmp.address.state} onChange={e => setAddr("state", e.target.value)} /></div>
              <div><label className="fieldlabel">ZIP / Postal Code</label>
                <input className="input" style={{ width:"100%" }} placeholder="10001" value={newEmp.address.zip} onChange={e => setAddr("zip", e.target.value)} /></div>
              <div><label className="fieldlabel">Country</label>
                <input className="input" style={{ width:"100%" }} placeholder="United States" value={newEmp.address.country} onChange={e => setAddr("country", e.target.value)} /></div>
            </div>
          )}

          {formSection === "employment" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div><label className="fieldlabel">Job Title</label>
                <input className="input" style={{ width:"100%" }} placeholder="Software Engineer" value={newEmp.title} onChange={e => set("title", e.target.value)} /></div>
              <div><label className="fieldlabel">Department</label>
                <select className="input" style={{ width:"100%" }} value={newEmp.dept} onChange={e => set("dept", e.target.value)}>
                  {D.DEPT.map(d => <option key={d.name}>{d.name}</option>)}
                </select></div>
              <div><label className="fieldlabel">Team</label>
                <input className="input" style={{ width:"100%" }} placeholder="Web" value={newEmp.team} onChange={e => set("team", e.target.value)} /></div>
              <div><label className="fieldlabel">Role</label>
                <select className="input" style={{ width:"100%" }} value={newEmp.role} onChange={e => set("role", e.target.value)}>
                  {D.ROLES.filter(r => r.key !== "guest").map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select></div>
              <div><label className="fieldlabel">Employment Type</label>
                <select className="input" style={{ width:"100%" }} value={newEmp.empType} onChange={e => set("empType", e.target.value)}>
                  {["Full-time","Part-time","Contract","Intern"].map(t => <option key={t}>{t}</option>)}
                </select></div>
              <div><label className="fieldlabel">Start Date</label>
                <input type="date" className="input" style={{ width:"100%" }} value={newEmp.startDate} onChange={e => set("startDate", e.target.value)} /></div>
              <div><label className="fieldlabel">Location</label>
                <input className="input" style={{ width:"100%" }} placeholder="San Francisco / Remote" value={newEmp.location} onChange={e => set("location", e.target.value)} /></div>
              <div style={{ gridColumn:"1/-1" }}><label className="fieldlabel">Notes</label>
                <textarea className="input" style={{ width:"100%", height:72, padding:"8px 12px", resize:"vertical", fontFamily:"inherit" }} placeholder="Any additional notes..." value={newEmp.notes} onChange={e => set("notes", e.target.value)} /></div>
            </div>
          )}

          {formSection === "emergency" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1", padding:"12px 14px", background:"var(--accent-soft)", borderRadius:"var(--r-md)", fontSize:14, color:"var(--accent-ink)" }}>
                Emergency contact information — used only in case of workplace emergencies.
              </div>
              <div><label className="fieldlabel">Contact Name</label>
                <input className="input" style={{ width:"100%" }} placeholder="Jane Doe" value={newEmp.emergencyName} onChange={e => set("emergencyName", e.target.value)} /></div>
              <div><label className="fieldlabel">Contact Phone</label>
                <input className="input" style={{ width:"100%" }} placeholder="+1 555 000 0001" value={newEmp.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} /></div>
              <div><label className="fieldlabel">Relationship</label>
                <select className="input" style={{ width:"100%" }} value={newEmp.emergencyRelation} onChange={e => set("emergencyRelation", e.target.value)}>
                  <option value="">Select…</option>
                  {["Spouse","Parent","Sibling","Partner","Friend","Other"].map(r => <option key={r}>{r}</option>)}
                </select></div>
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, paddingTop:14, borderTop:"1px solid var(--line-2)" }}>
            <div style={{ display:"flex", gap:6 }}>
              {SECTIONS.map(s => <div key={s} style={{ width:8, height:8, borderRadius:99, background: formSection===s ? "var(--accent)" : "var(--line)" }} />)}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
              {formSection !== "emergency"
                ? <Btn variant="soft" onClick={() => setFormSection(SECTIONS[SECTIONS.indexOf(formSection)+1])}>Next →</Btn>
                : <Btn variant="primary" onClick={handleAddEmployee} disabled={saving}>{saving ? "Creating…" : "Create Employee"}</Btn>
              }
            </div>
          </div>
        </Card>
      )}

      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search employees…" value={q} onChange={setQ} />
        <Select value={dept} options={deptOpts} onChange={setDept} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize: 14.5 }}>{list.length} employees</span>
      </div>
      <Card flush>
        <div style={{ overflowX:"auto" }}>
          <table className="table">
            <thead><tr><th>Name</th><th>Code</th><th>Title</th><th>Department</th><th>Type</th><th>Status</th><th>Email</th></tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div className="avatar" style={{ width:32, height:32, background: e.color||"#6b7a8d", fontSize:12, borderRadius:99, display:"grid", placeItems:"center", color:"#fff", fontWeight:700, flexShrink:0 }}>{e.initials||"?"}</div>
                      <div>
                        <div className="t-strong">{e.name}</div>
                        <div className="muted" style={{ fontSize:13 }}>{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editingCode?.id === e.id ? (
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input className="input" style={{ width:110, padding:"4px 8px", fontFamily:"var(--mono)", fontSize:13 }}
                          value={editingCode.code} onChange={ev => setEditingCode({ ...editingCode, code: ev.target.value })}
                          onKeyDown={ev => { if (ev.key==="Enter") handleUpdateCode(e.id, editingCode.code); if (ev.key==="Escape") setEditingCode(null); }} autoFocus />
                        <Btn variant="primary" sm onClick={() => handleUpdateCode(e.id, editingCode.code)}>Save</Btn>
                        <Btn variant="ghost" sm onClick={() => setEditingCode(null)}>✕</Btn>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:600, color:"var(--accent-ink)", background:"var(--accent-soft)", padding:"3px 8px", borderRadius:"var(--r-sm)" }}>{e.employeeCode||"—"}</span>
                        <Btn variant="ghost" sm icon="edit" onClick={() => setEditingCode({ id:e.id, code:e.employeeCode||"" })} />
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize:15 }}>{e.title}</td>
                  <td>{e.dept}</td>
                  <td><span className="muted" style={{ fontSize:14 }}>{e.type||e.empType}</span></td>
                  <td><StatusBadge value={e.status} /></td>
                  <td className="t-mono" style={{ fontSize:14.5 }}>{e.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ========== DEPARTMENTS ==========
export function Departments({ isDemo }) {
  const [departments, setDepartments] = useState(isDemo ? D.DEPT : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", lead: "E-101", count: 0, open: 0, color: "#2f6fdb" });

  const handleAddDepartment = () => {
    if (!newDept.name) return;
    const dept = {
      name: newDept.name,
      lead: newDept.lead,
      count: parseInt(newDept.count) || 0,
      open: parseInt(newDept.open) || 0,
      color: newDept.color
    };
    setDepartments([dept, ...departments]);
    setNewDept({ name: "", lead: "E-101", count: 0, open: 0, color: "#2f6fdb" });
    setShowAdd(false);
    showToast(`Department "${dept.name}" created successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Departments" sub={`${departments.length} departments`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New department"}</Btn>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Department Name</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Marketing" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Lead</label>
              <select className="input" style={{ width: "100%" }} value={newDept.lead} onChange={e => setNewDept({...newDept, lead: e.target.value})}>
                {D.EMP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Initial Members</label>
              <input type="number" className="input" style={{ width: "100%" }} value={newDept.count} onChange={e => setNewDept({...newDept, count: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Open Positions</label>
              <input type="number" className="input" style={{ width: "100%" }} value={newDept.open} onChange={e => setNewDept({...newDept, open: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Color</label>
              <select className="input" style={{ width: "100%" }} value={newDept.color} onChange={e => setNewDept({...newDept, color: e.target.value})}>
                <option value="#2f6fdb">Blue</option>
                <option value="#0d7d7d">Teal</option>
                <option value="#6d54d6">Violet</option>
                <option value="#15935f">Green</option>
                <option value="#c2790a">Amber</option>
                <option value="#b3543f">Red</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddDepartment}>Create Department</Btn>
          </div>
        </Card>
      )}

      <div className="grid cols-3" style={{ marginBottom:"var(--gap)" }}>
        {departments.map(d => (<Card key={d.name} title={d.name} sub={`${d.count} people · ${d.open} open positions`}
          actions={<Avatar id={d.lead} size={28} />}>
          <div style={{ fontSize: 15, color:"var(--ink-2)", lineHeight:1.6 }}>
            <div>Lead: <strong>{D.empById[d.lead]?.name}</strong></div>
            <div>Team members: <strong>{d.count}</strong></div>
            <div>Open roles: <strong>{d.open}</strong></div>
          </div>
        </Card>))}
      </div>
    </div>
  );
}

// ========== TEAMS ==========
export function Teams({ isDemo }) {
  const [teams, setTeams] = useState(isDemo ? D.TEAMS : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", dept: "Engineering", focus: "", lead: "E-101" });

  const handleAddTeam = () => {
    if (!newTeam.name) return;
    setTeams([...teams, { name: newTeam.name, dept: newTeam.dept, lead: newTeam.lead, members: [newTeam.lead], focus: newTeam.focus }]);
    setNewTeam({ name: "", dept: "Engineering", focus: "", lead: "E-101" });
    setShowAdd(false);
    showToast(`Team "${newTeam.name}" created successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Teams" sub={`${teams.length} teams`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New team"}</Btn>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Team Name</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Frontend" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Department</label>
              <select className="input" style={{ width: "100%" }} value={newTeam.dept} onChange={e => setNewTeam({...newTeam, dept: e.target.value})}>
                {D.DEPT.map(d => <option key={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Focus</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Customer-facing features" value={newTeam.focus} onChange={e => setNewTeam({...newTeam, focus: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Team Lead</label>
              <select className="input" style={{ width: "100%" }} value={newTeam.lead} onChange={e => setNewTeam({...newTeam, lead: e.target.value})}>
                {D.EMP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddTeam}>Create Team</Btn>
          </div>
        </Card>
      )}

      <div className="grid cols-2" style={{ marginBottom:"var(--gap)" }}>
        {teams.map(t => (<Card key={t.name} title={t.name} sub={t.focus}
          actions={<Avatar id={t.lead} size={28} />}>
          <div style={{ fontSize: 15, lineHeight:1.8 }}>
            <div><span className="muted">Department:</span> {t.dept}</div>
            <div><span className="muted">Members:</span></div>
            {t.members.map(m => <div key={m} className="muted" style={{ fontSize: 14, paddingLeft:16 }}>→ {D.empById[m]?.name}</div>)}
          </div>
        </Card>))}
      </div>
    </div>
  );
}

// ========== DOCUMENTS ==========
export function Documents({ isDemo }) {
  const [q, setQ] = useState("");
  const docs = isDemo ? D.DOCS : [];
  const list = docs.filter(d => q === "" || d.name.toLowerCase().includes(q.toLowerCase()));
  const uploadRef = useRef(null);

  const handleDownload = (doc) => {
    const content = "Contenido de prueba para el documento: " + doc.name;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.replace(/\s+/g, '_') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleView = (doc) => {
    alert(`👁️ Viendo documento:\n\nNombre: ${doc.name}\nTipo: ${doc.kind}\nTamaño: ${doc.size}\n\n(Esta es una vista previa de prueba)`);
  };

  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name).join(", ");
      showToast(`Successfully uploaded: ${fileNames}`);
      e.target.value = null; // reset
    }
  };

  return (
    <div className="page">
      <PageHead title="Documents" sub={`${docs.length} documents`}
        actions={<>
          <input type="file" multiple ref={uploadRef} style={{ display: "none" }} onChange={handleUpload} />
          <Btn variant="primary" icon="plus" onClick={() => uploadRef.current?.click()}>Upload</Btn>
        </>} />
      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search documents…" value={q} onChange={setQ} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize: 14.5 }}>{list.length} documents</span>
      </div>
      <Card flush>
        {list.length === 0 ? (
          <div style={{ textAlign:"center", padding:"36px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📄</div>
            <div style={{ fontSize:15, fontWeight:600, color:"var(--ink-2)", marginBottom:6 }}>No documents yet</div>
            <div style={{ fontSize:14 }}>Upload your first document to get started.</div>
          </div>
        ) : list.map(d => {
          const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
          return (<div key={d.id} className="lrow" style={{ display:"flex", alignItems:"center" }}>
            <div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize: 12, fontWeight:700 }}>{d.kind}</div>
            <div className="lr-main">
              <div className="lr-title">{d.name}</div>
              <div className="lr-sub">{D.empById[d.owner]?.name} · {d.updated}</div>
            </div>
            <div style={{ color:"var(--muted)", fontSize: 14, marginRight: 20 }}>{d.size}</div>
            <Badge tone={d.shared ? "green" : "gray"} dot style={{ marginRight: 20 }}>{d.shared ? "Shared" : "Private"}</Badge>
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="ghost" sm icon="eye" onClick={() => handleView(d)} />
              <Btn variant="ghost" sm icon="download" onClick={() => handleDownload(d)} />
            </div>
          </div>);
        })}
      </Card>
    </div>
  );
}

// ========== FILES ==========
export function Files({ access, isDemo }) {
  const [folders, setFolders] = useState([
    { name:"Engineering", count:48, color:"#2f6fdb" }, { name:"Design Assets", count:126, color:"#0d7d7d" },
    { name:"Product Specs", count:31, color:"#6d54d6" }, { name:"People & HR", count:22, color:"#15935f" },
    { name:"Brand & Marketing", count:64, color:"#c2790a" }, { name:"Contracts", count:18, color:"#b3543f" },
  ]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const uploadRef = useRef(null);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders([...folders, { name: newFolderName.trim(), count: 0, color: "#6b7a8d" }]);
    showToast(`Folder "${newFolderName.trim()}" created`);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleDownload = (doc) => {
    const content = "Contenido de prueba para el archivo: " + doc.name;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.replace(/\s+/g, '_') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleView = (doc) => {
    alert(`👁️ Viendo archivo:\n\nNombre: ${doc.name}\nTipo: ${doc.kind}\nTamaño: ${doc.size}\n\n(Vista previa de prueba)`);
  };

  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name).join(", ");
      showToast(`Successfully uploaded: ${fileNames}`);
      e.target.value = null; // reset
    }
  };

  return (
    <div className="page">
      <PageHead title="Files" sub="Shared company file storage · 2.4 GB of 10 GB used"
        actions={access === "full" ? <>
          <Btn variant="ghost" icon="folder" onClick={() => setShowNewFolder(!showNewFolder)}>New folder</Btn>
          <input type="file" multiple ref={uploadRef} style={{ display: "none" }} onChange={handleUpload} />
          <Btn variant="primary" icon="upload" onClick={() => uploadRef.current?.click()}>Upload</Btn>
        </> : <Badge tone="gray" dot>Read-only</Badge>} />

      {showNewFolder && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderRadius: "var(--r-lg)", border: "1px solid var(--line)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Folder name…" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); }} autoFocus />
          <Btn variant="ghost" onClick={() => setShowNewFolder(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleCreateFolder}>Create</Btn>
        </div>
      )}

      <div className="ch-title" style={{ fontSize: 15, fontWeight:600, marginBottom:12, color:"var(--ink-2)" }}>Folders</div>
      <div className="grid cols-3" style={{ marginBottom:"calc(var(--gap) + 6px)" }}>
        {folders.map(f => (
          <div className="card" key={f.name} style={{ padding:16, display:"flex", alignItems:"center", gap:13, cursor:"pointer" }}>
            <div className="tile-ico" style={{ background:f.color+"1a", color:f.color, width:44, height:44 }}><Icon name="folder" size={22} /></div>
            <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize: 16 }}>{f.name}</div><div className="muted" style={{ fontSize: 14 }}>{f.count} files</div></div>
            <Icon name="chevronRight" size={18} style={{ color:"var(--muted)" }} />
          </div>
        ))}
      </div>
      <Card title="Recent files" flush>
        <table className="table">
          <thead><tr><th>Name</th><th>Owner</th><th>Modified</th><th>Size</th><th style={{ textAlign:"right" }}>Actions</th></tr></thead>
          <tbody>
            {(isDemo ? D.DOCS.slice(0,6) : []).map(d => {
              const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
              return <tr key={d.id} className="clickable"><td><div style={{ display:"flex", alignItems:"center", gap:11 }}><div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize: 11, fontWeight:700, width:30, height:30 }}>{d.kind}</div><span className="t-strong">{d.name}</span></div></td><td>{D.empById[d.owner]?.name.split(" ")[0]}</td><td className="t-mono" style={{ fontSize: 14.5 }}>{d.updated}</td><td className="t-mono" style={{ fontSize: 14.5 }}>{d.size}</td><td style={{ textAlign:"right" }}><div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}><Btn variant="ghost" sm icon="eye" onClick={(e) => { e.stopPropagation(); handleView(d); }} /><Btn variant="ghost" sm icon="download" onClick={(e) => { e.stopPropagation(); handleDownload(d); }} /></div></td></tr>;
            })}
            {!isDemo && <tr><td colSpan={5} style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)" }}>No files yet. Upload your first file.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== ANNOUNCEMENTS ==========
export function Announcements({ isDemo }) {
  const [announcements, setAnnouncements] = useState(isDemo ? D.ANNOUNCE : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", body: "", dept: "Engineering", pinned: false });

  const handleAddAnnouncement = () => {
    if (!newAnn.title || !newAnn.body) return;
    const ann = {
      id: "A-" + (10 + announcements.length),
      title: newAnn.title,
      author: "E-101",
      dept: newAnn.dept,
      time: "Just now",
      pinned: newAnn.pinned,
      body: newAnn.body
    };
    setAnnouncements([ann, ...announcements]);
    setNewAnn({ title: "", body: "", dept: "Engineering", pinned: false });
    setShowAdd(false);
    showToast(`Announcement "${ann.title}" posted successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Announcements" sub={`${announcements.length} announcements`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New announcement"}</Btn>} />
      
      <div style={{ maxWidth:600 }}>
        {showAdd && (
          <Card style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <label className="fieldlabel">Title</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. System Maintenance" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="fieldlabel">Message</label>
              <textarea className="input" style={{ width: "100%", height: 100, padding: "10px 12px", resize: "vertical", fontFamily: "inherit" }} placeholder="Write your announcement here..." value={newAnn.body} onChange={e => setNewAnn({...newAnn, body: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, alignItems: "center" }}>
              <div>
                <label className="fieldlabel">Department</label>
                <select className="input" style={{ width: "100%" }} value={newAnn.dept} onChange={e => setNewAnn({...newAnn, dept: e.target.value})}>
                  <option value="General">General (All Company)</option>
                  {D.DEPT.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
                <input type="checkbox" id="pinned-check" checked={newAnn.pinned} onChange={e => setNewAnn({...newAnn, pinned: e.target.checked})} style={{ width: 16, height: 16 }} />
                <label htmlFor="pinned-check" style={{ fontSize: 14, cursor: "pointer" }}>Pin to top</label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleAddAnnouncement}>Post Announcement</Btn>
            </div>
          </Card>
        )}

        <div className="grid cols-1">
          {announcements.sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(a => (<Card key={a.id} title={<div style={{ display:"flex", alignItems:"center", gap:7 }}>{a.pinned && <Icon name="pin" size={13} style={{ color:"var(--accent)" }} />}{a.title}</div>}
            sub={D.empById[a.author]?.name + " · " + a.time}>
            <div style={{ fontSize: 15, color:"var(--ink-2)", lineHeight:1.6, marginBottom:12 }}>{a.body}</div>
            <Badge tone="gray" dot>{a.dept}</Badge>
          </Card>))}
        </div>
      </div>
    </div>
  );
}

// ========== CLIENTS ==========
export function Clients({ isDemo }) {
  const [clients, setClients] = useState(isDemo ? D.CLIENTS : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", industry: "Technology", contact: "", health: "New", status: "Prospect", mrr: "$0" });

  const handleAddClient = () => {
    if (!newClient.name) return;
    const client = {
      id: "C-0" + (clients.length + 1),
      name: newClient.name,
      industry: newClient.industry,
      contact: newClient.contact || "—",
      status: newClient.status,
      since: new Date().getFullYear().toString(),
      projects: 0,
      health: newClient.health,
      mrr: newClient.mrr,
      color: "#2f6fdb"
    };
    setClients([client, ...clients]);
    setNewClient({ name: "", industry: "Technology", contact: "", health: "New", status: "Prospect", mrr: "$0" });
    setShowAdd(false);
    showToast(`Client "${client.name}" added successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Clients" sub={`${clients.length} clients`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New client"}</Btn>} />
      
      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Company Name</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Acme Corp" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Contact Person</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Jane Doe" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Industry</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Retail" value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Status</label>
              <select className="input" style={{ width: "100%" }} value={newClient.status} onChange={e => setNewClient({...newClient, status: e.target.value})}>
                <option value="Prospect">Prospect</option>
                <option value="Active">Active</option>
                <option value="Churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="fieldlabel">Health</label>
              <select className="input" style={{ width: "100%" }} value={newClient.health} onChange={e => setNewClient({...newClient, health: e.target.value})}>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Excellent">Excellent</option>
                <option value="At risk">At risk</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="fieldlabel">Est. MRR</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. $5,000" value={newClient.mrr} onChange={e => setNewClient({...newClient, mrr: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddClient}>Add Client</Btn>
          </div>
        </Card>
      )}

      <Card flush>
        <table className="table">
          <thead><tr><th>Client</th><th>Industry</th><th>Contact</th><th>Projects</th><th>Health</th><th>MRR</th><th>Status</th></tr></thead>
          <tbody>
            {clients.length === 0 && <tr><td colSpan={7} style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)" }}>No clients yet. Add your first client above.</td></tr>}
            {clients.map(c => (<tr key={c.id}>
              <td><div className="t-strong">{c.name}</div><div className="muted" style={{ fontSize: 13.5 }}>{c.id}</div></td>
              <td>{c.industry}</td>
              <td>{c.contact}</td>
              <td className="mono">{c.projects}</td>
              <td><StatusBadge value={c.health} /></td>
              <td className="mono">{c.mrr}</td>
              <td><StatusBadge value={c.status} /></td>
            </tr>))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== INVOICES ==========
export function Invoices({ isDemo }) {
  const [invoices, setInvoices] = useState(isDemo ? D.INVOICES : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: "", amount: "$0", due: "TBD", status: "Draft" });

  const handleAddInvoice = () => {
    if (!newInvoice.client || newInvoice.amount === "$0") return;
    const inv = {
      id: "INV-" + (2040 + invoices.length + 1),
      client: newInvoice.client,
      amount: newInvoice.amount,
      issued: "Today",
      due: newInvoice.due,
      status: newInvoice.status
    };
    setInvoices([inv, ...invoices]);
    setNewInvoice({ client: "", amount: "$0", due: "TBD", status: "Draft" });
    setShowAdd(false);
    showToast(`Invoice "${inv.id}" created successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Invoices" sub={`${invoices.length} invoices`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "New invoice"}</Btn>} />
      
      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Client</label>
              {isDemo ? (
                <select className="input" style={{ width: "100%" }} value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}>
                  {D.CLIENTS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              ) : (
                <input className="input" style={{ width: "100%" }} placeholder="Client name" value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})} />
              )}
            </div>
            <div>
              <label className="fieldlabel">Amount</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. $1,500" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Due Date</label>
              <input type="date" className="input" style={{ width: "100%" }} value={newInvoice.due} onChange={e => setNewInvoice({...newInvoice, due: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Status</label>
              <select className="input" style={{ width: "100%" }} value={newInvoice.status} onChange={e => setNewInvoice({...newInvoice, status: e.target.value})}>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddInvoice}>Create Invoice</Btn>
          </div>
        </Card>
      )}

      <Card flush>
        <table className="table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Issued</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.length === 0 && <tr><td colSpan={6} style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)" }}>No invoices yet. Create your first invoice above.</td></tr>}
            {invoices.map(i => (<tr key={i.id}>
              <td><div className="mono t-strong">{i.id}</div></td>
              <td>{i.client}</td>
              <td className="mono">{i.amount}</td>
              <td>{i.issued}</td>
              <td>{i.due}</td>
              <td><StatusBadge value={i.status} /></td>
            </tr>))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== REPORTS ==========
export function Reports({ isDemo }) {
  const handleExport = () => {
    const csv = ["Metric,Value",
      "Total tasks done,124","Tasks in progress,48","Tasks in review,21",
      "Tasks todo,63","Tasks blocked,7",
      "Monthly revenue Jun,$278k","Active employees,142","Ongoing projects,6"
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "reports.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <PageHead title="Reports" actions={isDemo && <Btn variant="ghost" icon="download" onClick={handleExport}>Export CSV</Btn>} />
      {isDemo ? (
        <div className="grid cols-2" style={{ marginBottom:"var(--gap)" }}>
          <Card title="Task Status" sub="Current distribution">
            <Donut data={D.REPORTS.taskStatus} size={160} center={D.REPORTS.taskStatus.reduce((s,d)=>s+d.val,0)} />
          </Card>
          <Card title="Weekly Activity" sub="Last 7 days">
            <BarChart data={D.REPORTS.weekly} />
          </Card>
        </div>
      ) : (
        <Card>
          <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
            <div style={{ fontSize:17, fontWeight:600, marginBottom:8, color:"var(--ink-2)" }}>No data yet</div>
            <div style={{ fontSize:15 }}>Reports will appear once your team starts logging tasks, projects, and activities.</div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ========== MESSAGES ==========
export function Messages({ currentUser, isDemo }) {
  const threads = isDemo ? D.THREADS : [];
  const [sel, setSel] = useState(threads[0]?.id || null);
  const [draft, setDraft] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);

  const t = threads.find(x => x.id === sel);

  const handleSend = () => {
    if (!draft.trim() && attachments.length === 0) return;
    setDraft("");
    setAttachments([]);
    setShowStickers(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isDemo) {
    return (
      <div className="page">
        <PageHead title="Messages" />
        <Card>
          <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>💬</div>
            <div style={{ fontSize:17, fontWeight:600, marginBottom:8, color:"var(--ink-2)" }}>No messages yet</div>
            <div style={{ fontSize:15 }}>Messages will appear here once your team members are added.</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 62px)", overflow: "hidden" }}>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", flex:1, overflow:"hidden", background: "var(--surface)" }}>
        {/* list */}
        <div style={{ borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", minHeight:0, background: "var(--surface-2)" }}>
          <div style={{ padding:"16px 14px", borderBottom:"1px solid var(--line-2)", background:"var(--surface)" }}><Search placeholder="Search messages…" style={{ minWidth:0, width:"100%" }} /></div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {threads.map(th => {
              const e = D.empById[th.id];
              return (
                <div key={th.id} onClick={() => setSel(th.id)} style={{ display:"flex", gap:11, padding:"12px 14px", cursor:"pointer", borderBottom:"1px solid var(--line-2)", background: sel===th.id ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent" }}>
                  <div style={{ position:"relative" }}>
                    <Avatar id={th.id} size={40} />
                    {th.online && <span style={{ position:"absolute", bottom:0, right:0, width:11, height:11, borderRadius:99, background:"var(--green)", border:"2px solid var(--surface)" }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}><span style={{ fontSize: 15, fontWeight:600 }}>{e?.name}</span><span className="muted" style={{ fontSize: 13 }}>{th.time}</span></div>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginTop:3 }}>
                      <span className="muted" style={{ fontSize: 14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{th.last}</span>
                      {th.unread > 0 && <span className="ni-badge" style={{ background:"var(--accent)" }}>{th.unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* thread */}
        <div style={{ display:"flex", flexDirection:"column", minHeight:0, background:"var(--surface-2) url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode:"overlay", opacity: 0.98 }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 18px", borderBottom:"1px solid var(--line)", background:"var(--surface)", zIndex:10 }}>
            <Avatar id={sel} size={34} />
            <div style={{ flex:1 }}><div style={{ fontSize: 15.5, fontWeight:600 }}>{D.empById[sel]?.name}</div><div className="muted" style={{ fontSize: 13.5 }}>{t.online ? "Online" : "Offline"}</div></div>
            <Btn variant="ghost" sm icon="search" /><Btn variant="ghost" sm icon="moreV" />
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 18px", display:"flex", flexDirection:"column", gap:12 }}>
            {t.msgs.map((m, i) => {
              const mine = m[0] === "me";
              return (
                <div key={i} style={{ display:"flex", flexDirection: mine?"row-reverse":"row", alignItems:"flex-end" }}>
                  <div style={{ maxWidth:"70%" }}>
                    <div style={{ background: mine ? "var(--accent)" : "var(--surface)", color: mine ? "#ffffff" : "var(--ink)", border: mine?"none":"1px solid var(--line)", padding:"8px 12px 10px", borderRadius:12, borderTopRightRadius: mine?0:12, borderTopLeftRadius: mine?12:0, fontSize: 15.5, lineHeight:1.4, boxShadow:"0 1px 2px rgba(0,0,0,0.1)", position:"relative" }}>
                      {m[1]}
                      <div className="muted" style={{ fontSize: 12, marginTop:4, textAlign:"right", float:"right", marginLeft:12, paddingTop:6, color: mine ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>
                        {m[2]} {mine && <Icon name="check" size={13} style={{ color: mine ? "#a5f3fc" : "#53bdeb", marginLeft:2, verticalAlign:"bottom" }} />}
                      </div>
                      <div style={{ clear:"both" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div style={{ padding:"12px 18px", background:"var(--surface-2)", borderTop:"1px solid var(--line)", display:"flex", gap:10, overflowX:"auto" }}>
              {attachments.map((file, i) => (
                <div key={i} style={{ position:"relative", width:64, height:64, borderRadius:8, background:"var(--surface)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center", padding:6, textAlign:"center", fontSize: 13 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", wordBreak:"break-all" }}>{file.name}</div>
                  <button onClick={() => removeAttachment(i)} style={{ position:"absolute", top:-6, right:-6, background:"var(--red)", color:"#fff", border:"none", borderRadius:99, width:20, height:20, display:"grid", placeItems:"center", cursor:"pointer", fontSize: 13, boxShadow:"var(--sh-xs)" }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Stickers & GIFs Box */}
          {showStickers && (
            <div style={{ height:220, background:"var(--surface)", borderTop:"1px solid var(--line)", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", gap:16, padding:"10px 18px", borderBottom:"1px solid var(--line-2)", background:"var(--surface-2)" }}>
                <div style={{ fontSize: 15, fontWeight:600, cursor:"pointer", color:"var(--ink)" }}>Stickers</div>
                <div style={{ fontSize: 15, fontWeight:600, cursor:"pointer", color:"var(--muted)" }}>GIFs</div>
              </div>
              <div style={{ flex:1, padding:18, overflowY:"auto", display:"flex", gap:12, flexWrap:"wrap", alignContent:"flex-start" }}>
                {["👍","😂","🚀","🎉","❤️","🔥","💯","🙏","👋","👀","🙌","🤔","😎","💡","✨","🎈","🔥","💪"].map((st, i) => (
                  <div key={i} style={{ fontSize: 34, cursor:"pointer", transition:"transform .1s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} onClick={() => { setDraft(draft + st); }}>{st}</div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div style={{ padding:"10px 14px", background:"var(--surface-2)", display:"flex", gap:8, alignItems:"flex-end" }}>
            <div style={{ display:"flex", gap:4, paddingBottom:5 }}>
              <Btn variant="ghost" sm icon="sparkles" onClick={() => setShowStickers(!showStickers)} style={{ padding:0, width:36, height:36, borderRadius:99, background:"var(--surface)", border:"none" }} title="Stickers" />
              <Btn variant="ghost" sm icon="plus" onClick={() => fileRef.current?.click()} style={{ padding:0, width:36, height:36, borderRadius:99, background:"var(--surface)", border:"none" }} title="Attach Files" />
              <input type="file" multiple ref={fileRef} style={{ display:"none" }} onChange={handleFileChange} />
            </div>
            <div style={{ flex:1, background:"var(--surface)", borderRadius:20, padding:"8px 16px", minHeight:40, border:"1px solid var(--line)", display:"flex", alignItems:"center" }}>
              <input className="input" style={{ width:"100%", border:"none", background:"transparent", padding:0, height:24, boxShadow:"none", outline:"none" }} placeholder="Type a message" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleSend();}} />
            </div>
            {(draft.trim() || attachments.length > 0) ? (
              <Btn variant="primary" icon="arrowRight" onClick={handleSend} style={{ width:40, height:40, borderRadius:99, padding:0, flexShrink:0, marginBottom:1 }} />
            ) : (
              <Btn variant="ghost" icon="play" style={{ width:40, height:40, borderRadius:99, padding:0, flexShrink:0, marginBottom:1, background:"var(--surface)", border:"none", color:"var(--muted)" }} title="Voice Message" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MEETINGS ==========
function MiniCalendar() {
  const days = ["S","M","T","W","T","F","S"];
  const cells = []; for (let i=0;i<35;i++){ const d=i-0; cells.push(d>=0&&d<30?d+1:null); }
  const events = [2,5,11,17,24];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
        {days.map((d,i)=><div key={i} style={{ textAlign:"center", fontSize: 13, color:"var(--muted)", fontWeight:600 }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((c,i)=>(
          <div key={i} style={{ aspectRatio:"1", display:"grid", placeItems:"center", fontSize: 14, borderRadius:8,
            background: c===2?"var(--accent)":events.includes(c)?"var(--accent-soft)":"transparent",
            color: c===2?"#fff":events.includes(c)?"var(--accent-ink)":c?"var(--ink-2)":"transparent",
            fontWeight: c===2||events.includes(c)?600:400, cursor:c?"pointer":"default" }}>{c||""}</div>
        ))}
      </div>
    </div>
  );
}

export function Meetings({ role, onNavigate, isDemo }) {
  const guest = role === "guest";
  const allMeetings = isDemo ? D.MEETINGS : [];
  const list = guest ? allMeetings.slice(0,1) : allMeetings;
  const [showSchedule, setShowSchedule] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", room: "Zoom", day: "Today", time: "09:00" });

  const handleSchedule = () => {
    if (!newMeeting.title) return;
    showToast(`Meeting "${newMeeting.title}" scheduled successfully`);
    setNewMeeting({ title: "", room: "Zoom", day: "Today", time: "09:00" });
    setShowSchedule(false);
  };

  return (
    <div className="page">
      <PageHead title="Meetings" sub={guest ? "Meetings you're invited to" : "Your upcoming meetings"}
        actions={!guest && <>
          <Btn variant="ghost" icon="calendar" onClick={() => onNavigate?.("schedule")}>Calendar</Btn>
          <Btn variant="primary" icon="plus" onClick={() => setShowSchedule(!showSchedule)}>{showSchedule ? "Cancel" : "Schedule"}</Btn>
        </>} />

      {showSchedule && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Meeting Title</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Weekly Sync" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Room / Platform</label>
              <select className="input" style={{ width: "100%" }} value={newMeeting.room} onChange={e => setNewMeeting({...newMeeting, room: e.target.value})}>
                <option>Zoom</option><option>Meet</option><option>Teams</option><option>Room A</option><option>Room B</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Day</label>
              <select className="input" style={{ width: "100%" }} value={newMeeting.day} onChange={e => setNewMeeting({...newMeeting, day: e.target.value})}>
                <option>Today</option><option>Tomorrow</option><option>Mon</option><option>Tue</option><option>Wed</option><option>Thu</option><option>Fri</option>
              </select>
            </div>
            <div>
              <label className="fieldlabel">Time</label>
              <input type="time" className="input" style={{ width: "100%" }} value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowSchedule(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSchedule}>Schedule Meeting</Btn>
          </div>
        </Card>
      )}

      <div className="dash-split">
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          {list.length === 0 && (
            <div className="card" style={{ padding:"36px 24px", textAlign:"center", color:"var(--muted)" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>📅</div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--ink-2)", marginBottom:6 }}>No meetings scheduled</div>
              <div style={{ fontSize:14 }}>Use the Schedule button to set up your first meeting.</div>
            </div>
          )}
          {list.map((m, i) => (
            <div className="card" key={i} style={{ padding:"var(--pad-card)", display:"flex", gap:16, alignItems:"center" }}>
              <div style={{ textAlign:"center", minWidth:62, padding:"10px 8px", background:"var(--accent-soft)", borderRadius:10 }}>
                <div style={{ fontSize: 13, fontWeight:600, color:"var(--accent-ink)", textTransform:"uppercase" }}>{m.time.split(" · ")[0]}</div>
                <div className="mono" style={{ fontSize: 19, fontWeight:700, color:"var(--accent-ink)", marginTop:2 }}>{m.time.split(" · ")[1]}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: 16.5, fontWeight:600 }}>{m.title}</div>
                <div className="muted" style={{ fontSize: 14.5, marginTop:3, display:"flex", alignItems:"center", gap:6 }}><Icon name="meetings" size={14} /> {m.room} · {m.who.length} attendees</div>
              </div>
              <AvatarStack ids={m.who} size={30} max={4} />
              <Btn variant="soft" sm icon="play" onClick={() => showToast(`Joining "${m.title}"... link copied to clipboard`)}>Join</Btn>
            </div>
          ))}
        </div>
        <Card title="June 2026" flush>
          <div style={{ padding:"16px var(--pad-card)" }}>
            <MiniCalendar />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ========== NOTIFICATIONS ==========
export function Notifications({ isDemo }) {
  const notifs = isDemo ? D.NOTIFS : [];
  return (
    <div className="page">
      <PageHead title="Notifications" />
      <Card flush>
        {notifs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"36px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🔔</div>
            <div style={{ fontSize:15, fontWeight:600, color:"var(--ink-2)", marginBottom:6 }}>No notifications</div>
            <div style={{ fontSize:14 }}>You're all caught up!</div>
          </div>
        ) : notifs.map((n, i) => (<div key={i} className="lrow">
          <Avatar id={n.who} size={32} />
          <div className="lr-main">
            <div className="lr-title">{D.empById[n.who]?.name}</div>
            <div className="lr-sub">{n.text}</div>
            <div className="lr-sub" style={{ marginTop:6, fontSize: 13 }}>{n.time}</div>
          </div>
          {n.unread && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)" }} />}
        </div>))}
      </Card>
    </div>
  );
}

// ========== SETTINGS ==========
function Toggle({ on, onClick }) {
  return <div className={"toggle" + (on ? " on" : "")} onClick={onClick} />;
}

function SetRow({ title, sub, children }) {
  return <div className="set-row"><div className="sr-main"><div className="sr-title">{title}</div>{sub && <div className="sr-sub">{sub}</div>}</div>{children}</div>;
}

export function Settings({ role, currentUser, onOpenTweaks, company, isDemo }) {
  const [tab, setTab] = useState("Profile");
  const [toggles, setToggles] = useState({ email:true, push:true, mentions:true, digest:false, twofa:true, sessions:false });
  const [teamMembers, setTeamMembers] = useState([
    { id: "E-101", name: "Dana Whitfield", email: "dana@company.com", role: "admin", status: "Active" },
    { id: "E-102", name: "Marcus Lindell", email: "marcus@company.com", role: "manager", status: "Active" },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "employee" });
  const photoUploadRef = useRef(null);

  // Employee credentials state
  const [credSearch, setCredSearch] = useState("");
  const [resetMap, setResetMap] = useState({});   // id → new temp password after reset
  const [copiedId, setCopiedId] = useState(null); // id that was just copied

  // Build employee list with generated codes (demo uses D.EMP, real would fetch)
  const allEmployees = D.EMP.map(e => {
    const num = e.id.replace("E-", "");
    return { ...e, employeeCode: `EMP-${num}` };
  });
  const filteredEmployees = allEmployees.filter(e =>
    e.name.toLowerCase().includes(credSearch.toLowerCase()) ||
    e.employeeCode.toLowerCase().includes(credSearch.toLowerCase()) ||
    e.dept.toLowerCase().includes(credSearch.toLowerCase())
  );

  const handleCopyCode = (e) => {
    navigator.clipboard?.writeText(e.employeeCode).catch(() => {});
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = (e) => {
    const newPass = Math.random().toString(36).slice(2, 10).toUpperCase();
    setResetMap(prev => ({ ...prev, [e.id]: newPass }));
    showToast(`Temporary password reset for ${e.name}`);
  };
  const tg = k => setToggles(s => ({ ...s, [k]: !s[k] }));
  const roleObj = D.ROLES.find(r => r.key === role);
  const tabs = ["Profile","Notifications","Security","Appearance"].concat(role === "admin" ? ["Workspace","Team Management"] : []);

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast(`Photo updated successfully: ${e.target.files[0].name}`);
      e.target.value = null; // reset
    }
  };

  return (
    <div className="page" style={{ maxWidth:980 }}>
      <PageHead title="Settings" sub="Manage your account and workspace preferences" />
      <div style={{ marginBottom:"var(--gap)" }}><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>

      {tab === "Profile" && (
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:16, paddingBottom:20, borderBottom:"1px solid var(--line-2)", marginBottom:6 }}>
            <Avatar id={currentUser.id} size={64} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize: 20, fontWeight:600 }}>{currentUser.name}</div>
              <div className="muted" style={{ fontSize: 15 }}>{currentUser.title} · {currentUser.email || "guest@external.com"}</div>
              <div style={{ marginTop:8 }}><Badge tone="teal" dot>{roleObj.name}</Badge></div>
            </div>
            <input type="file" accept="image/*" ref={photoUploadRef} style={{ display: "none" }} onChange={handlePhotoUpload} />
            <Btn variant="ghost" icon="upload" onClick={() => photoUploadRef.current?.click()}>Change photo</Btn>
          </div>
          <div className="grid cols-2" style={{ marginTop:18 }}>
            <div><label className="fieldlabel">Full name</label><input className="input" style={{ width:"100%" }} defaultValue={currentUser.name} /></div>
            <div><label className="fieldlabel">Job title</label><input className="input" style={{ width:"100%" }} defaultValue={currentUser.title} /></div>
            <div><label className="fieldlabel">Email</label><input className="input" style={{ width:"100%" }} defaultValue={currentUser.email || ""} /></div>
            <div><label className="fieldlabel">Department</label><input className="input" style={{ width:"100%" }} defaultValue={currentUser.dept || "—"} /></div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}><Btn variant="ghost">Cancel</Btn><Btn variant="primary" onClick={() => showToast("Profile updated successfully")}>Save changes</Btn></div>
        </Card>
      )}

      {tab === "Notifications" && (
        <Card title="Notification preferences">
          <SetRow title="Email notifications" sub="Receive updates about tasks, mentions and projects by email."><Toggle on={toggles.email} onClick={()=>tg("email")} /></SetRow>
          <SetRow title="Push notifications" sub="Browser and mobile push for time-sensitive updates."><Toggle on={toggles.push} onClick={()=>tg("push")} /></SetRow>
          <SetRow title="Mentions only" sub="Only notify me when I'm directly mentioned."><Toggle on={toggles.mentions} onClick={()=>tg("mentions")} /></SetRow>
          <SetRow title="Weekly digest" sub="A Monday summary of your team's activity."><Toggle on={toggles.digest} onClick={()=>tg("digest")} /></SetRow>
        </Card>
      )}

      {tab === "Security" && (
        <Card title="Security">
          <SetRow title="Two-factor authentication" sub="Add an extra layer of security to your account."><Toggle on={toggles.twofa} onClick={()=>tg("twofa")} /></SetRow>
          <SetRow title="Active sessions" sub="Sign out of all other active sessions."><Btn variant="ghost" sm onClick={() => showToast("All other sessions have been signed out")}>Manage</Btn></SetRow>
          <SetRow title="Password" sub="Last changed 3 months ago."><Btn variant="ghost" sm icon="lock" onClick={() => showToast("Password reset link sent to your email")}>Change</Btn></SetRow>
          <SetRow title="Login alerts" sub="Email me about logins from new devices."><Toggle on={toggles.sessions} onClick={()=>tg("sessions")} /></SetRow>
        </Card>
      )}

      {tab === "Appearance" && (
        <Card title="Appearance">
          <SetRow title="Theme & accent color" sub="Customize colors, sidebar style and density from the live Tweaks panel."><Btn variant="soft" sm icon="sparkles" onClick={onOpenTweaks}>Open Tweaks</Btn></SetRow>
          <SetRow title="Interface language" sub="English (United States)"><Btn variant="ghost" sm onClick={() => showToast("More languages coming soon")}>Change</Btn></SetRow>
          <SetRow title="Start page" sub="Page shown when you open WorkCentral."><Badge tone="gray">Dashboard</Badge></SetRow>
        </Card>
      )}

      {tab === "Workspace" && role === "admin" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--gap)" }}>
          <Card title="Workspace" sub="Admin-only settings">
            <SetRow title="Workspace name" sub="Shown across the app and in emails."><input className="input" defaultValue={company?.name || "WorkCentral Inc."} /></SetRow>
            <SetRow title="Company ID" sub="Unique identifier for your workspace. Employees need this to log in.">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Badge tone="gray">{company?.companyId || "WC-2026-XXXX"}</Badge>
                <Btn variant="ghost" sm icon="copy" onClick={() => {
                  navigator.clipboard?.writeText(company?.companyId || "WC-2026-XXXX").catch(() => {});
                  showToast("Company ID copied");
                }}>Copy</Btn>
              </div>
            </SetRow>
            <SetRow title="Industry" sub="Your company's industry sector."><Badge tone="blue">{company?.industry || "Technology"}</Badge></SetRow>
            <SetRow title="Billing plan" sub="Business · renews Jan 2027"><Badge tone="green" dot>Active</Badge></SetRow>
            <SetRow title="Data export" sub="Export all workspace data."><Btn variant="ghost" sm icon="download" onClick={() => showToast("Export started — you'll receive an email when ready")}>Export</Btn></SetRow>
          </Card>

          <Card title="Employee Credentials" sub="View and reset login codes for your team. Share these if someone loses access.">
            <div style={{ marginBottom:14 }}>
              <Search placeholder="Search by name, code or department…" value={credSearch} onChange={setCredSearch} />
            </div>
            <div style={{ overflowX:"auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Employee Code</th>
                    <th>Temp Password</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(e => (
                    <tr key={e.id}>
                      <td><Person id={e.id} /></td>
                      <td style={{ fontSize:14, color:"var(--ink-3)" }}>{e.dept}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{
                            fontFamily:"var(--mono)", fontSize:13, fontWeight:600,
                            color:"var(--accent-ink)", background:"var(--accent-soft)",
                            padding:"3px 8px", borderRadius:"var(--r-sm)", letterSpacing:".04em"
                          }}>{e.employeeCode}</span>
                          <Btn variant="ghost" sm icon={copiedId === e.id ? "check" : "copy"}
                            onClick={() => handleCopyCode(e)}>
                            {copiedId === e.id ? "Copied" : "Copy"}
                          </Btn>
                        </div>
                      </td>
                      <td>
                        {resetMap[e.id] ? (
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{
                              fontFamily:"var(--mono)", fontSize:13, fontWeight:600,
                              color:"var(--ink)", background:"var(--surface-2)",
                              padding:"3px 8px", borderRadius:"var(--r-sm)", border:"1px solid var(--line)"
                            }}>{resetMap[e.id]}</span>
                            <Btn variant="ghost" sm icon="copy" onClick={() => {
                              navigator.clipboard?.writeText(resetMap[e.id]).catch(() => {});
                              showToast("Password copied");
                            }}>Copy</Btn>
                          </div>
                        ) : (
                          <span style={{ fontSize:13, color:"var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign:"right" }}>
                        <Btn variant="ghost" sm icon="refresh" onClick={() => handleResetPassword(e)}>
                          Reset password
                        </Btn>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--muted)", padding:"20px 0" }}>No employees match your search</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:12, padding:"10px 12px", background:"var(--surface-2)", borderRadius:"var(--r-md)", fontSize:13, color:"var(--muted)", display:"flex", gap:6, alignItems:"flex-start" }}>
              <Icon name="info" size={14} style={{ marginTop:1, flexShrink:0 }} />
              <span>
                To log in, employees use the <strong>Employee Code tab</strong> on the login screen with:
                Company ID <strong>{company?.companyId || "WC-2026-XXXX"}</strong> + their Employee Code + their password.
              </span>
            </div>
          </Card>
        </div>
      )}

      {tab === "Team Management" && role === "admin" && (
        <div>
          <Card title={`Team Members (${teamMembers.length})`} sub="Manage your team and assign roles">
            <div style={{ marginBottom:20 }}>
              <Btn variant="primary" icon="plus" onClick={() => setShowAddMember(!showAddMember)}>
                {showAddMember ? "Cancel" : "Add member"}
              </Btn>
            </div>

            {showAddMember && (
              <div style={{ padding:16, background:'var(--surface-2)', borderRadius:'var(--r-lg)', marginBottom:20, border:'1px solid var(--line)' }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                  <div>
                    <label className="fieldlabel">Full name</label>
                    <input
                      className="input"
                      style={{ width:"100%" }}
                      placeholder="Jane Smith"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="fieldlabel">Email</label>
                    <input
                      className="input"
                      type="email"
                      style={{ width:"100%" }}
                      placeholder="jane@company.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label className="fieldlabel">Role</label>
                  <select
                    className="input"
                    style={{ width:"100%" }}
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="lead">Team Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ padding:12, background:'var(--accent-soft)', borderRadius:'var(--r-md)', fontSize: 14.5, color:'var(--accent-ink)', marginBottom:14 }}>
                  <Icon name="info" size={14} style={{ marginRight:6, verticalAlign:'middle' }} />
                  A temporary password will be sent to {newMember.email || "the user's email"}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <Btn variant="ghost" onClick={() => setShowAddMember(false)}>Cancel</Btn>
                  <Btn variant="primary" onClick={() => {
                    if (newMember.name && newMember.email) {
                      const tempPassword = Math.random().toString(36).slice(2, 10).toUpperCase();
                      setTeamMembers([...teamMembers, {
                        id: "E-" + (100 + teamMembers.length),
                        name: newMember.name,
                        email: newMember.email,
                        role: newMember.role,
                        status: "Invited"
                      }]);
                      setNewMember({ name: "", email: "", role: "employee" });
                      setShowAddMember(false);
                    }
                  }}>
                    Send invite
                  </Btn>
                </div>
              </div>
            )}

            <Card flush>
              <table className="table">
                <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {teamMembers.map(member => (
                    <tr key={member.id}>
                      <td><Person id={member.id} /></td>
                      <td className="t-mono" style={{ fontSize: 14.5 }}>{member.email}</td>
                      <td><Badge tone="blue">{D.ROLES.find(r => r.key === member.role)?.name}</Badge></td>
                      <td><StatusBadge value={member.status} /></td>
                      <td style={{ textAlign:"right" }}><Btn variant="ghost" sm icon="trash" onClick={() => setTeamMembers(teamMembers.filter(m2 => m2.id !== member.id))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Card>
        </div>
      )}
    </div>
  );
}

// ========== SCHEDULE (stub) ==========
export function Schedule({ role, currentUser, isDemo }) {
  const [schedule, setSchedule] = useState(isDemo ? D.SCHEDULE : []);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting", day: 1, start: 9, len: 1 });
  const [weekOffset, setWeekOffset] = useState(0);

  const DAYS = ["Mon","Tue","Wed","Thu","Fri"];
  const DATES = ["2","3","4","5","6"];
  const EV_COLOR = {
    meeting:["#e6effb","#235ab3","#2f6fdb"],
    focus:["var(--accent-soft)","var(--accent-ink)","var(--accent)"],
    review:["#ece8fa","#523fb0","#6d54d6"],
    client:["#fbf0db","#95590a","#c2790a"],
    interview:["#e3f4ec","#0d6b44","#15935f"]
  };

  const startH = 8, endH = 18, hourH = 52;
  const personal = role === "employee";
  const events = personal ? schedule.filter(e => e.who === currentUser.id || ["meeting"].includes(e.type)) : schedule;

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    const ev = {
      who: currentUser.id,
      type: newEvent.type,
      title: newEvent.title,
      day: parseInt(newEvent.day),
      start: parseFloat(newEvent.start),
      len: parseFloat(newEvent.len)
    };
    setSchedule([...schedule, ev]);
    setNewEvent({ title: "", type: "meeting", day: 1, start: 9, len: 1 });
    setShowAdd(false);
    showToast(`Event "${ev.title}" scheduled successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Schedule" sub={personal ? "Your week at a glance" : "Team schedule and meetings"}
        actions={<>
          <Btn variant="ghost" icon="chevronLeft" onClick={() => setWeekOffset(w => w - 1)} />
          <span style={{ fontSize: 15, fontWeight:600, minWidth:150, textAlign:"center" }}>
            {["May 26–30","Jun 2–6","Jun 9–13","Jun 16–20","Jun 23–27"][Math.max(0, Math.min(4, weekOffset + 1))]}, 2026
          </span>
          <Btn variant="ghost" icon="chevronRight" onClick={() => setWeekOffset(w => w + 1)} />
          <Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "Event"}</Btn>
        </>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Event Title</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Weekly Sync" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Event Type</label>
              <select className="input" style={{ width: "100%" }} value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                <option value="meeting">Meeting</option>
                <option value="focus">Focus Time</option>
                <option value="review">Review</option>
                <option value="client">Client Call</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Day of Week</label>
              <select className="input" style={{ width: "100%" }} value={newEvent.day} onChange={e => setNewEvent({...newEvent, day: e.target.value})}>
                {DAYS.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="fieldlabel">Start Time (24h)</label>
              <select className="input" style={{ width: "100%" }} value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})}>
                {Array.from({ length: 21 }).map((_, i) => <option key={i} value={8 + (i * 0.5)}>{8 + Math.floor(i * 0.5)}:{i % 2 === 0 ? "00" : "30"}</option>)}
              </select>
            </div>
            <div>
              <label className="fieldlabel">Duration (Hours)</label>
              <select className="input" style={{ width: "100%" }} value={newEvent.len} onChange={e => setNewEvent({...newEvent, len: e.target.value})}>
                <option value="0.5">30 mins</option>
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddEvent}>Schedule Event</Btn>
          </div>
        </Card>
      )}

      <Card flush>
        <div style={{ overflowX:"auto" }}>
          <div style={{ minWidth:760 }}>
            {/* header */}
            <div style={{ display:"grid", gridTemplateColumns:`64px repeat(5,1fr)`, borderBottom:"1px solid var(--line)" }}>
              <div />
              {DAYS.map((d, i) => (
                <div key={d} style={{ padding:"12px 10px", textAlign:"center", borderLeft:"1px solid var(--line-2)" }}>
                  <div style={{ fontSize: 13.5, color:"var(--muted)", fontWeight:600, letterSpacing:".04em" }}>{d.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight:600, marginTop:2, color: i===1?"var(--accent)":"var(--ink)" }}>{DATES[i]}</div>
                </div>
              ))}
            </div>
            {/* grid */}
            <div style={{ display:"grid", gridTemplateColumns:`64px repeat(5,1fr)`, position:"relative" }}>
              {/* hours col */}
              <div>
                {Array.from({ length: endH - startH }).map((_, i) => (
                  <div key={i} style={{ height:hourH, fontSize: 13, color:"var(--muted)", textAlign:"right", paddingRight:9, transform:"translateY(-6px)", fontFamily:"var(--mono)" }}>{startH + i}:00</div>
                ))}
              </div>
              {DAYS.map((d, di) => (
                <div key={d} style={{ borderLeft:"1px solid var(--line-2)", position:"relative" }}>
                  {Array.from({ length: endH - startH }).map((_, i) => <div key={i} style={{ height:hourH, borderBottom:"1px solid var(--line-2)" }} />)}
                  {events.filter(e => e.day === di + 1).map((e, ei) => {
                    const [bg, fg, bar] = EV_COLOR[e.type] || EV_COLOR.meeting;
                    return (
                      <div key={ei} style={{ position:"absolute", left:5, right:5, top:(e.start - startH) * hourH + 2, height:e.len * hourH - 5,
                        background:bg, borderLeft:`3px solid ${bar}`, borderRadius:7, padding:"6px 8px", overflow:"hidden", cursor:"pointer" }}>
                        <div style={{ fontSize: 13.5, fontWeight:600, color:fg, lineHeight:1.25 }}>{e.title}</div>
                        <div style={{ fontSize: 12.5, color:fg, opacity:.8, marginTop:2 }}>{Math.floor(e.start)}:{(e.start%1?"30":"00")} · {D.empById[e.who]?.name.split(" ")[0]}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ========== ATTENDANCE ==========
export function Attendance({ access }) {
  const [showMark, setShowMark] = useState(false);
  const [marked, setMarked] = useState({});
  const statuses = ["Present","Remote","On leave","Late"];
  const rows = D.EMP.slice(0, 12).map((e, i) => {
    const st = e.status === "On leave" ? "On leave" : e.status === "Remote" ? "Remote" : (i % 7 === 0 ? "Late" : "Present");
    const cin = st === "On leave" ? "—" : st === "Late" ? "09:42" : (i % 2 ? "08:58" : "09:03");
    const hrs = st === "On leave" ? "—" : (7 + (i % 3) + (i % 2 ? 0.5 : 0)).toFixed(1) + "h";
    return { e, st, cin, hrs };
  });
  const present = rows.filter(r => r.st === "Present").length;
  const remote = rows.filter(r => r.st === "Remote").length;

  const handleExport = () => {
    const csv = ["Employee,Department,Clock In,Hours,Status",
      ...rows.map(r => `${r.e.name},${r.e.dept},${r.cin},${r.hrs},${r.st}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendance.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleSaveMark = () => {
    const count = Object.keys(marked).length;
    showToast(`Attendance marked for ${count} employee${count !== 1 ? "s" : ""}`);
    setShowMark(false);
    setMarked({});
  };

  return (
    <div className="page">
      <PageHead title="Attendance" sub="Today · June 2, 2026"
        actions={access === "full" ? <>
          <Btn variant="ghost" icon="download" onClick={handleExport}>Export</Btn>
          <Btn variant="primary" icon="check" onClick={() => setShowMark(!showMark)}>{showMark ? "Cancel" : "Mark attendance"}</Btn>
        </> : <Badge tone="gray" dot>Read-only</Badge>} />

      {showMark && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Mark today's attendance</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {rows.map(({ e }) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)", border: "1px solid var(--line)" }}>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{e.name.split(" ")[0]}</div>
                <select className="input" style={{ padding: "4px 8px", fontSize: 13, height: 30 }}
                  value={marked[e.id] || "Present"}
                  onChange={ev => setMarked({ ...marked, [e.id]: ev.target.value })}>
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowMark(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSaveMark}>Save attendance</Btn>
          </div>
        </Card>
      )}
      <div className="grid cols-4" style={{ marginBottom:"var(--gap)" }}>
        {[["Present","green",present],["Remote","blue",remote],["On leave","amber",rows.filter(r=>r.st==="On leave").length],["Late","red",rows.filter(r=>r.st==="Late").length]].map(([l,tn,v]) => (
          <div className="stat" key={l}><div className="st-top"><div className="st-ico" style={{ background:`var(--${tn}-soft)`, color:`var(--${tn})` }}><Icon name="userCheck" size={18} /></div><div className="st-label">{l}</div></div><div className="st-val">{v}</div></div>
        ))}
      </div>
      <Card flush>
        <table className="table">
          <thead><tr><th>Employee</th><th>Department</th><th>Clock in</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(({ e, st, cin, hrs }) => (
              <tr key={e.id}><td><Person id={e.id} /></td><td className="t-strong">{e.dept}</td><td className="t-mono">{cin}</td><td className="t-mono">{hrs}</td><td><StatusBadge value={st} /></td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== DIENSTPLAN ==========
const DE_MONTHS    = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const DE_DAYS      = ['So','Mo','Di','Mi','Do','Fr','Sa']; // 0 = Sonntag
const STATUS_CFG   = {
  work:     { icon: 'check',    color: 'var(--accent)',  bg: 'var(--accent-soft)',  label: 'Working'  },
  vacation: { icon: 'sun',      color: '#c2790a',        bg: '#fbf0db',             label: 'Vacation' },
  sick:     { icon: 'zap',      color: '#d4453e',        bg: '#fbe7e6',             label: 'Sick'     },
  free:     { icon: 'moon',     color: '#6b7a8d',        bg: 'var(--surface-2)',    label: 'Free'     },
};
const WORK_TYPES_DEMO = ['Frontend dev','Backend work','Design review','Sprint planning','Client call','Code review','On-site'];
const DEMO_TASKS_SETS = [ // conjuntos de tareas demo para la vista de día
  [{ startTime:'08:00', endTime:'12:00', title:'Morning dev session', notes:'' }, { startTime:'13:00', endTime:'17:00', title:'Code review', notes:'' }],
  [{ startTime:'09:00', endTime:'17:30', title:'Sprint planning', notes:'Full team' }],
  [{ startTime:'08:30', endTime:'13:00', title:'Client call prep', notes:'' }, { startTime:'14:00', endTime:'18:00', title:'Implementation', notes:'' }],
  [{ startTime:'10:00', endTime:'18:00', title:'Design sprint', notes:'' }],
];

function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}
function dowOf(ym, d) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, d).getDay(); // 0=Sun
}
function toDateStr(ym, d) {
  return `${ym}-${String(d).padStart(2, '0')}`;
}
function entryKey(userId, date) { return `${userId}_${date}`; }
function hhmToMin(hm) { const [h, m] = hm.split(':').map(Number); return h * 60 + m; }

export function Dienstplan({ role, isDemo }) {
  const canManage = role === 'admin';

  const [view, setView] = useState('month'); // 'month' | 'day'

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dayDate, setDayDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  });

  const [users,      setUsers]      = useState([]);
  const [entries,    setEntries]    = useState({});
  const [dayEntries, setDayEntries] = useState({});
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({ status: 'work', notes: '', tasks: [] });
  const [saving,     setSaving]     = useState(false);

  // ── Carga datos del mes ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (isDemo) {
      const demoUsers = D.EMP.map(e => ({ _id: e.id, name: e.name, initials: e.initials, color: e.color, role: e.role }));
      setUsers(demoUsers);
      const total = daysInMonth(month);
      const [y, m] = month.split('-').map(Number);
      const map = {};
      D.EMP.forEach((emp, ei) => {
        for (let d = 1; d <= total; d++) {
          const dow = new Date(y, m - 1, d).getDay();
          if (dow === 0 || dow === 6) continue;
          const hash   = (ei * 31 + d * 7 + m) % 10;
          const status = hash < 7 ? 'work' : hash === 7 ? 'vacation' : hash === 8 ? 'sick' : 'free';
          const date   = toDateStr(month, d);
          const tasks  = status === 'work' ? DEMO_TASKS_SETS[(ei + d) % DEMO_TASKS_SETS.length] : [];
          map[entryKey(emp.id, date)] = { _id: entryKey(emp.id, date), userId: emp.id, date, status, tasks, workType: status === 'work' ? WORK_TYPES_DEMO[(ei + d) % WORK_TYPES_DEMO.length] : '', notes: '' };
        }
      });
      setEntries(map);
      return;
    }
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/dienstplan?month=${month}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { entries: [], users: [] })
      .then(({ entries: raw, users: rawU }) => {
        setUsers(rawU);
        const map = {};
        raw.forEach(e => { map[entryKey(e.userId, e.date)] = e; });
        setEntries(map);
      })
      .catch(() => {});
  }, [month, isDemo]);

  // ── Carga datos del día (vista Tag) ───────────────────────────────────────
  React.useEffect(() => {
    if (view !== 'day') return;
    if (isDemo) {
      const filtered = {};
      Object.values(entries).forEach(e => { if (e.date === dayDate) filtered[entryKey(e.userId, e.date)] = e; });
      setDayEntries(filtered);
      return;
    }
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/dienstplan/day?date=${dayDate}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { entries: [], users: [] })
      .then(({ entries: raw }) => {
        const map = {};
        raw.forEach(e => { map[entryKey(e.userId, e.date)] = e; });
        setDayEntries(map);
      })
      .catch(() => {});
  }, [view, dayDate, isDemo, entries]);

  // ── Derivados del mes ────────────────────────────────────────────────────
  const [y, mn]  = month.split('-').map(Number);
  const totalDays  = daysInMonth(month);
  const days       = Array.from({ length: totalDays }, (_, i) => i + 1);
  const monthLabel = `${DE_MONTHS[mn - 1]} ${y}`;
  const todayStr   = toDateStr(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`, new Date().getDate());

  const prevMonth = () => { const d = new Date(y, mn - 2, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); };
  const nextMonth = () => { const d = new Date(y, mn,     1); setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); };

  // ── Navegación por día ───────────────────────────────────────────────────
  const shiftDay = (delta) => {
    const [dy, dm, dd] = dayDate.split('-').map(Number);
    const next = new Date(dy, dm - 1, dd + delta);
    setDayDate(`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`);
  };

  const [dateFmt] = useState(() => new Intl.DateTimeFormat('de-DE', { weekday:'long', day:'numeric', month:'long' }));
  const formatDateLabel = (dateStr) => {
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    return dateFmt.format(new Date(dy, dm - 1, dd));
  };

  // ── Modal ────────────────────────────────────────────────────────────────
  const openModal = (user, date) => {
    if (!canManage) return;
    const entry = entries[entryKey(user._id, date)] || dayEntries[entryKey(user._id, date)];
    setForm({ status: entry?.status || 'work', notes: entry?.notes || '', tasks: entry?.tasks ? entry.tasks.map(t => ({ ...t })) : [] });
    setModal({ userId: user._id, date, userName: user.name, entry: entry || null });
  };

  const addTask    = ()        => setForm(f => ({ ...f, tasks: [...f.tasks, { startTime:'09:00', endTime:'17:00', title:'', notes:'' }] }));
  const removeTask = (i)       => setForm(f => ({ ...f, tasks: f.tasks.filter((_, ti) => ti !== i) }));
  const updateTask = (i, k, v) => setForm(f => ({ ...f, tasks: f.tasks.map((t, ti) => ti === i ? { ...t, [k]: v } : t) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const tasks = form.status === 'work' ? form.tasks : [];
      if (isDemo) {
        const key = entryKey(modal.userId, modal.date);
        const entry = { _id: key, userId: modal.userId, date: modal.date, ...form, tasks };
        setEntries(prev => ({ ...prev, [key]: entry }));
        setDayEntries(prev => ({ ...prev, [key]: entry }));
        setModal(null);
        return;
      }
      const token = localStorage.getItem('authToken');
      const res   = await fetch(`${API_URL}/api/dienstplan`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ userId: modal.userId, date: modal.date, ...form, tasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const key = entryKey(data.userId, data.date);
      setEntries(prev => ({ ...prev, [key]: data }));
      setDayEntries(prev => ({ ...prev, [key]: data }));
      setModal(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDemo) {
      const key = entryKey(modal.userId, modal.date);
      setEntries(prev => { const n = { ...prev }; delete n[key]; return n; });
      setDayEntries(prev => { const n = { ...prev }; delete n[key]; return n; });
      setModal(null);
      return;
    }
    const token = localStorage.getItem('authToken');
    const res   = await fetch(`${API_URL}/api/dienstplan?userId=${modal.userId}&date=${modal.date}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const key = entryKey(modal.userId, modal.date);
      setEntries(prev => { const n = { ...prev }; delete n[key]; return n; });
      setDayEntries(prev => { const n = { ...prev }; delete n[key]; return n; });
      setModal(null);
    }
  };

  const CELL_W    = 38;   // px — ancho fijo por columna de día en vista mensual
  const TL_START  = 6*60; // 06:00 en minutos desde medianoche
  const TL_END    = 22*60;// 22:00 en minutos
  const TL_HOURS  = Array.from({ length: 17 }, (_, i) => i + 6); // 06..22
  const TL_TOTAL  = TL_END - TL_START; // 960 minutos de rango total
  const HR_H      = 56;   // px por hora en la vista de día

  const viewToggle = (
    <div style={{ display:'flex', border:'1px solid var(--line)', borderRadius:'var(--r-md)', overflow:'hidden' }}>
      {['month','day'].map(v => (
        <button key={v} type="button" onClick={() => setView(v)}
          style={{ padding:'5px 13px', fontSize:13, fontWeight:600, background: view===v ? 'var(--accent)' : 'transparent', color: view===v ? '#fff' : 'var(--ink-2)', border:'none', borderLeft: v==='day' ? '1px solid var(--line)' : 'none', cursor:'pointer', transition:'all .15s' }}>
          {v === 'month' ? 'Monat' : 'Tag'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page">
      <PageHead
        title="Dienstplan"
        sub={`${users.length} Mitarbeiter · ${view === 'month' ? monthLabel : formatDateLabel(dayDate)}`}
        actions={
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {viewToggle}
            {view === 'month' ? (
              <>
                <Btn variant="ghost" icon="chevronLeft"  sm onClick={prevMonth} />
                <span style={{ fontSize:15, fontWeight:600, minWidth:130, textAlign:'center' }}>{monthLabel}</span>
                <Btn variant="ghost" icon="chevronRight" sm onClick={nextMonth} />
              </>
            ) : (
              <>
                <Btn variant="ghost" icon="chevronLeft"  sm onClick={() => shiftDay(-1)} />
                <span style={{ fontSize:14, fontWeight:600, minWidth:180, textAlign:'center' }}>{formatDateLabel(dayDate)}</span>
                <Btn variant="ghost" icon="chevronRight" sm onClick={() => shiftDay(1)} />
              </>
            )}
          </div>
        }
      />

      {/* ── Vista mensual ──────────────────────────────────────────────────── */}
      {view === 'month' && (
        <>
          <div style={{ overflowX:'auto', border:'1px solid var(--line)', borderRadius:'var(--r-lg)', background:'var(--surface)' }}>
            <table style={{ borderCollapse:'collapse', minWidth:'100%' }}>
              <colgroup>
                <col style={{ width:170, minWidth:170 }} />
                {days.map(d => <col key={d} style={{ width:CELL_W, minWidth:CELL_W }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ position:'sticky', left:0, top:0, zIndex:4, background:'var(--surface)', padding:'10px 14px', textAlign:'left', fontWeight:600, fontSize:13.5, borderBottom:'1px solid var(--line)', whiteSpace:'nowrap' }}>
                    Mitarbeiter
                  </th>
                  {days.map(d => {
                    const dow     = dowOf(month, d);
                    const isWknd  = dow === 0 || dow === 6;
                    const dateS   = toDateStr(month, d);
                    const isToday = dateS === todayStr;
                    return (
                      <th key={d} style={{ position:'sticky', top:0, zIndex:3, background: isToday ? 'var(--accent-soft)' : isWknd ? 'var(--surface-2)' : 'var(--surface)', borderBottom:'1px solid var(--line)', borderLeft:'1px solid var(--line-2)', padding:'6px 2px', textAlign:'center', fontSize:12 }}>
                        <div style={{ fontWeight:700, color: isToday ? 'var(--accent-ink)' : isWknd ? 'var(--muted)' : 'var(--ink)' }}>{d}</div>
                        <div style={{ color:'var(--muted)', fontSize:11, marginTop:1 }}>{DE_DAYS[dow]}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={totalDays + 1} style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)', fontSize:15 }}>
                      No employees found for this workspace.
                    </td>
                  </tr>
                )}
                {users.map(user => (
                  <tr key={user._id} style={{ borderTop:'1px solid var(--line-2)' }}>
                    <td style={{ position:'sticky', left:0, zIndex:1, background:'var(--surface)', padding:'6px 14px', whiteSpace:'nowrap', borderRight:'1px solid var(--line)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:26, height:26, borderRadius:99, background:user.color||'#6b7a8d', color:'#fff', fontSize:11, fontWeight:700, display:'grid', placeItems:'center', flexShrink:0 }}>
                          {user.initials||'?'}
                        </div>
                        <span style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', maxWidth:110 }}>{user.name}</span>
                      </div>
                    </td>
                    {days.map(d => {
                      const dateS    = toDateStr(month, d);
                      const dow      = dowOf(month, d);
                      const isWknd   = dow === 0 || dow === 6;
                      const isToday  = dateS === todayStr;
                      const entry    = entries[entryKey(user._id, dateS)];
                      const cfg      = entry ? STATUS_CFG[entry.status] : null;
                      const taskCnt  = entry?.tasks?.length || 0;
                      const tipText  = entry?.status === 'work' && taskCnt > 0
                        ? entry.tasks.map(t => `${t.startTime}–${t.endTime}  ${t.title}`).join('\n')
                        : entry?.workType || undefined;
                      return (
                        <td key={d}
                          onClick={() => openModal(user, dateS)}
                          title={tipText}
                          style={{ textAlign:'center', borderLeft:'1px solid var(--line-2)', padding:'3px 1px', cursor: canManage ? 'pointer' : 'default', background: isToday ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : isWknd ? 'var(--surface-2)' : undefined, transition:'background .1s' }}>
                          {cfg && (
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:30, borderRadius:6, margin:'1px', background: cfg.bg, gap:3 }}>
                              <Icon name={cfg.icon} size={13} style={{ color:cfg.color }} />
                              {entry.status === 'work' && taskCnt > 0 && (
                                <span style={{ fontSize:9, fontWeight:700, color:cfg.color, lineHeight:1 }}>{taskCnt}</span>
                              )}
                            </div>
                          )}
                          {!cfg && canManage && (
                            <div style={{ height:30, display:'flex', justifyContent:'center', alignItems:'center', opacity:0 }} className="cell-add-hint">
                              <Icon name="plus" size={12} style={{ color:'var(--muted)' }} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', padding:'12px 16px', background:'var(--surface-2)', borderRadius:'var(--r-lg)', border:'1px solid var(--line)', marginTop:'var(--gap)', alignItems:'center' }}>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14 }}>
                <div style={{ width:22, height:22, borderRadius:5, background:cfg.bg, display:'grid', placeItems:'center' }}>
                  <Icon name={cfg.icon} size={12} style={{ color:cfg.color }} />
                </div>
                <span style={{ color:'var(--ink-2)' }}>{cfg.label}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14 }}>
              <div style={{ width:22, height:22, borderRadius:5, background:'var(--surface-2)', border:'1px solid var(--line)' }} />
              <span style={{ color:'var(--muted)' }}>Weekend</span>
            </div>
            {!canManage && <span style={{ marginLeft:'auto', fontSize:13, color:'var(--muted)' }}>Read-only view</span>}
          </div>
        </>
      )}

      {/* ── Vista de día (timeline 06:00–22:00) ────────────────────────────── */}
      {view === 'day' && (
        <div style={{ overflowX:'auto', border:'1px solid var(--line)', borderRadius:'var(--r-lg)', background:'var(--surface)' }}>
          <div style={{ display:'flex', minWidth: Math.max(600, users.length * 140 + 60) }}>

            {/* Eje horario */}
            <div style={{ width:54, flexShrink:0, borderRight:'1px solid var(--line)', paddingTop:41 }}>
              {TL_HOURS.map(h => (
                <div key={h} style={{ height:HR_H, display:'flex', alignItems:'flex-start', paddingLeft:6, paddingTop:4, fontSize:11, color:'var(--muted)', borderTop:'1px solid var(--line-2)', boxSizing:'border-box' }}>
                  {String(h).padStart(2,'0')}:00
                </div>
              ))}
            </div>

            {/* Columna por empleado */}
            {users.map(user => {
              const entry  = dayEntries[entryKey(user._id, dayDate)];
              const cfg    = entry ? STATUS_CFG[entry.status] : null;
              const dimmed = entry && entry.status !== 'work';
              return (
                <div key={user._id} style={{ flex:'1 1 130px', minWidth:130, borderLeft:'1px solid var(--line-2)', display:'flex', flexDirection:'column' }}>
                  {/* Cabecera de empleado */}
                  <div style={{ height:40, display:'flex', alignItems:'center', justifyContent:'center', gap:7, borderBottom:'1px solid var(--line)', padding:'0 8px', flexShrink:0, background:'var(--surface)' }}>
                    <div style={{ width:22, height:22, borderRadius:99, background:user.color||'#6b7a8d', color:'#fff', fontSize:10, fontWeight:700, display:'grid', placeItems:'center', flexShrink:0 }}>
                      {user.initials||'?'}
                    </div>
                    <span style={{ fontSize:12.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
                    {cfg && <div style={{ width:7, height:7, borderRadius:99, background:cfg.color, flexShrink:0 }} title={cfg.label} />}
                  </div>

                  {/* Área de timeline */}
                  <div style={{ position:'relative', height: TL_HOURS.length * HR_H, cursor: canManage ? 'pointer' : 'default', background: dimmed ? 'repeating-linear-gradient(135deg,transparent,transparent 6px,rgba(0,0,0,.018) 6px,rgba(0,0,0,.018) 12px)' : undefined }}
                    onClick={() => canManage && openModal(user, dayDate)}>
                    {/* Líneas de hora */}
                    {TL_HOURS.map((_, hi) => (
                      <div key={hi} style={{ position:'absolute', top: hi * HR_H, left:0, right:0, borderTop:'1px solid var(--line-2)' }} />
                    ))}
                    {/* Fondo de estado no-work */}
                    {cfg && entry.status !== 'work' && (
                      <div style={{ position:'absolute', inset:0, background:cfg.bg, opacity:.35, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}>
                        <Icon name={cfg.icon} size={26} style={{ color:cfg.color, opacity:.6 }} />
                        <span style={{ fontSize:12, color:cfg.color, fontWeight:600 }}>{cfg.label}</span>
                      </div>
                    )}
                    {/* Bloques de tarea */}
                    {entry?.status === 'work' && (entry.tasks || []).map((task, ti) => {
                      const startMin = hhmToMin(task.startTime);
                      const endMin   = hhmToMin(task.endTime);
                      const top    = (startMin - TL_START) / TL_TOTAL * (TL_HOURS.length * HR_H);
                      const height = Math.max(22, (endMin - startMin) / TL_TOTAL * (TL_HOURS.length * HR_H));
                      return (
                        <div key={ti} style={{ position:'absolute', top, left:4, right:4, height, background:'var(--accent)', borderRadius:5, padding:'3px 6px', overflow:'hidden', boxSizing:'border-box', zIndex:1 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {task.startTime}–{task.endTime}
                          </div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,.85)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {task.title}
                          </div>
                        </div>
                      );
                    })}
                    {/* Hint de celda vacía */}
                    {!entry && canManage && (
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:.25 }}>
                        <Icon name="plus" size={20} style={{ color:'var(--muted)' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {users.length === 0 && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:15, padding:40 }}>
                No employees found for this workspace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de edición ───────────────────────────────────────────────── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', padding:24, minWidth:380, maxWidth:460, width:'100%', maxHeight:'85vh', overflowY:'auto', border:'1px solid var(--line)', boxShadow:'0 20px 60px rgba(0,0,0,.4)' }}>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Schicht bearbeiten</div>
            <div className="muted" style={{ fontSize:14, marginBottom:20 }}>
              {modal.userName} · {formatDateLabel(modal.date)}
            </div>

            <label className="fieldlabel" style={{ display:'block', marginBottom:8 }}>Status</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, status: key, tasks: key !== 'work' ? [] : f.tasks }))}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', background: form.status === key ? cfg.bg : 'var(--surface-2)', border:`1.5px solid ${form.status === key ? cfg.color : 'transparent'}`, borderRadius:'var(--r-md)', cursor:'pointer', fontSize:14, fontWeight: form.status === key ? 700 : 500, color: form.status === key ? cfg.color : 'var(--ink-2)', transition:'all .15s' }}>
                  <Icon name={cfg.icon} size={15} style={{ color:cfg.color }} />
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Editor de bloques de trabajo */}
            {form.status === 'work' && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <label className="fieldlabel" style={{ margin:0 }}>Arbeitsblöcke</label>
                  <button type="button" onClick={addTask}
                    style={{ fontSize:12, color:'var(--accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:'2px 6px' }}>
                    + Block hinzufügen
                  </button>
                </div>
                {form.tasks.length === 0 && (
                  <div style={{ fontSize:13, color:'var(--muted)', padding:'8px 0' }}>Noch keine Blöcke — klick auf "+ Block hinzufügen".</div>
                )}
                {form.tasks.map((task, i) => (
                  <div key={i} style={{ background:'var(--surface-2)', borderRadius:'var(--r-md)', padding:12, marginBottom:8, border:'1px solid var(--line-2)' }}>
                    <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <div style={{ flex:1 }}>
                        <label className="fieldlabel" style={{ fontSize:11 }}>Von</label>
                        <input type="time" className="input" style={{ width:'100%' }}
                          value={task.startTime} onChange={e => updateTask(i, 'startTime', e.target.value)} />
                      </div>
                      <div style={{ flex:1 }}>
                        <label className="fieldlabel" style={{ fontSize:11 }}>Bis</label>
                        <input type="time" className="input" style={{ width:'100%' }}
                          value={task.endTime} onChange={e => updateTask(i, 'endTime', e.target.value)} />
                      </div>
                      <button type="button" onClick={() => removeTask(i)}
                        style={{ alignSelf:'flex-end', padding:'6px 8px', background:'none', border:'none', cursor:'pointer', color:'var(--muted)' }}>
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                    <div style={{ marginBottom:6 }}>
                      <label className="fieldlabel" style={{ fontSize:11 }}>Titel</label>
                      <input className="input" style={{ width:'100%' }} placeholder="z. B. Frontend-Entwicklung"
                        value={task.title} onChange={e => updateTask(i, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="fieldlabel" style={{ fontSize:11 }}>Notizen</label>
                      <input className="input" style={{ width:'100%' }} placeholder="Optional…"
                        value={task.notes} onChange={e => updateTask(i, 'notes', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom:22 }}>
              <label className="fieldlabel">Notizen (optional)</label>
              <input className="input" style={{ width:'100%' }} placeholder="Weitere Hinweise…"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} />
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center' }}>
              {modal.entry && <Btn variant="ghost" icon="trash" sm onClick={handleDelete}>Löschen</Btn>}
              <div style={{ flex:1 }} />
              <Btn variant="ghost" onClick={() => setModal(null)}>Abbrechen</Btn>
              <Btn variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Speichern…' : 'Speichern'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PERSONALREGLEMENT ==========
export function Personalreglement({ onNavigate }) {
  const handleDownloadReglamento = () => {
    const content = "Reglamento de Prueba - WorkCentral\n\n" +
                    "1. Horario de Trabajo:\nEl horario regular es de 9:00 AM a 6:00 PM, de lunes a viernes.\n\n" +
                    "2. Trabajo Remoto:\nSe permite el trabajo remoto hasta 3 días a la semana.\n\n" +
                    "3. Vacaciones y Permisos:\nTodo empleado tiene derecho a 20 días hábiles de vacaciones al año.\n\n" +
                    "4. Código de Conducta:\nFomentamos un ambiente de respeto, inclusión y profesionalismo.\n\n" +
                    "5. Uso de Equipos:\nLos equipos proporcionados son estrictamente para uso laboral.";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reglamento_Personal_Prueba.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <PageHead title="Personalreglement" sub="Reglamento del Personal" />
      <Card style={{ maxWidth: 700, margin: "20px auto", padding: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, borderBottom: "1px solid var(--line-2)", paddingBottom: 20 }}>
          <Icon name="book" size={36} style={{ color: "var(--accent)" }} />
          <div style={{ fontSize: 24, fontWeight: 600 }}>Reglamento de Prueba</div>
        </div>
        
        <div style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 17 }}>1. Horario de Trabajo</strong>
            <p style={{ margin: "6px 0 0 0" }}>El horario regular es de 9:00 AM a 6:00 PM, de lunes a viernes. Se permite flexibilidad de ±1 hora previa coordinación con el líder del equipo.</p>
          </div>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 17 }}>2. Trabajo Remoto</strong>
            <p style={{ margin: "6px 0 0 0" }}>Se permite el trabajo remoto hasta 3 días a la semana para roles elegibles. Los empleados deben asegurar una conexión estable a internet durante sus horas laborables.</p>
          </div>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 17 }}>3. Vacaciones y Permisos</strong>
            <p style={{ margin: "6px 0 0 0" }}>Todo empleado tiene derecho a 20 días hábiles de vacaciones al año. Las solicitudes deben hacerse con al menos 2 semanas de anticipación a través del sistema.</p>
          </div>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 17 }}>4. Código de Conducta</strong>
            <p style={{ margin: "6px 0 0 0" }}>Fomentamos un ambiente de respeto, inclusión y profesionalismo. No se tolerará ningún tipo de discriminación, acoso o comportamiento inapropiado.</p>
          </div>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 17 }}>5. Uso de Equipos</strong>
            <p style={{ margin: "6px 0 0 0" }}>Los equipos proporcionados por la empresa (laptops, monitores, periféricos) son estrictamente para uso laboral y deben devolverse en buen estado al término del contrato.</p>
          </div>
        </div>
        
        <div style={{ marginTop: 35, display: "flex", gap: 12, borderTop: "1px solid var(--line-2)", paddingTop: 20 }}>
          <Btn variant="primary" icon="download" onClick={handleDownloadReglamento}>Descargar Reglamento</Btn>
          <Btn variant="ghost" onClick={() => onNavigate("dashboard")}>Volver al Dashboard</Btn>
        </div>
      </Card>
    </div>
  );
}

// ========== VADEMECUM ==========
const VADM_CATS = ["All", "Procedures", "Policies", "Emergency", "Guides"];
const CAT_TONE  = { Procedures: "teal", Policies: "green", Emergency: "red", Guides: "amber" };
const CAT_ICON  = { Emergency: "zap", Procedures: "documents", Policies: "shield", Guides: "info" };
const CAT_BG    = { Emergency: "#fbe7e6", Procedures: "var(--accent-soft)", Policies: "#e3f4ec", Guides: "#fbf0db" };
const CAT_FG    = { Emergency: "#a8312b", Procedures: "var(--accent-ink)", Policies: "#0d6b44", Guides: "#95590a" };

function renderMd(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <div key={i} style={{ fontSize:16.5, fontWeight:700, color:"var(--ink)", margin:"20px 0 6px" }}>{line.slice(3)}</div>;
    }
    if (line.startsWith('# ')) {
      return <div key={i} style={{ fontSize:20, fontWeight:700, color:"var(--ink)", margin:"24px 0 8px" }}>{line.slice(2)}</div>;
    }
    const isBullet = line.startsWith('- ');
    const numMatch = line.match(/^(\d+)\. (.*)/);
    if (isBullet || numMatch) {
      const raw   = isBullet ? line.slice(2) : numMatch[2];
      const label = isBullet ? "•" : numMatch[1] + ".";
      const parts = raw.split(/\*\*([^*]+)\*\*/g);
      return (
        <div key={i} style={{ display:"flex", gap:8, margin:"4px 0", paddingLeft:4, lineHeight:1.65 }}>
          <span style={{ color:"var(--accent)", flexShrink:0, fontWeight:700, minWidth:16 }}>{label}</span>
          <span style={{ color:"var(--ink-2)" }}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color:"var(--ink)" }}>{p}</strong> : p)}
          </span>
        </div>
      );
    }
    if (line === '') return <div key={i} style={{ height:10 }} />;
    const parts = line.split(/\*\*([^*]+)\*\*/g);
    return (
      <p key={i} style={{ margin:"4px 0", lineHeight:1.75, color:"var(--ink-2)" }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color:"var(--ink)" }}>{p}</strong> : p)}
      </p>
    );
  });
}

function VadRow({ art, onClick }) {
  const dateStr = art.updatedAt
    ? new Date(art.updatedAt).toLocaleDateString("en-US", { month:"short", day:"numeric" })
    : "";
  return (
    <div className="lrow" onClick={onClick} style={{ cursor:"pointer", alignItems:"center" }}>
      <div style={{ width:36, height:36, borderRadius:8, background:CAT_BG[art.category]||"var(--surface-2)", display:"grid", placeItems:"center", flexShrink:0, color:CAT_FG[art.category]||"var(--muted)" }}>
        <Icon name={CAT_ICON[art.category]||"documents"} size={17} />
      </div>
      <div className="lr-main">
        <div className="lr-title" style={{ display:"flex", alignItems:"center", gap:7 }}>
          {art.isPinned && <Icon name="pin" size={11} style={{ color:"var(--accent)", flexShrink:0 }} />}
          {art.title}
        </div>
        <div className="lr-sub">{art.createdBy?.name}{dateStr ? ` · ${dateStr}` : ""}</div>
      </div>
      <Badge tone={CAT_TONE[art.category]||"gray"}>{art.category}</Badge>
      <Icon name="chevronRight" size={16} style={{ color:"var(--muted)", flexShrink:0 }} />
    </div>
  );
}

export function Vademecum({ role, isDemo }) {
  const canManage              = role === "admin";
  const [articles, setArticles] = useState([]);
  const [q, setQ]               = useState("");
  const [cat, setCat]           = useState("All");
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState(null);     // "create" | "edit" | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState({ title:"", category:"Guides", content:"", isPinned:false });
  const [saving, setSaving]     = useState(false);

  React.useEffect(() => {
    if (isDemo) { setArticles(D.VADM); return; }
    const token = localStorage.getItem("authToken");
    fetch(`${API_URL}/api/vademecum`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isDemo]);

  const filtered = articles.filter(a =>
    (cat === "All" || a.category === cat) &&
    (q === "" || a.title.toLowerCase().includes(q.toLowerCase()) || (a.content||"").toLowerCase().includes(q.toLowerCase()))
  );
  const pinned   = filtered.filter(a => a.isPinned);
  const unpinned = filtered.filter(a => !a.isPinned);

  const openCreate = () => {
    setForm({ title:"", category:"Guides", content:"", isPinned:false });
    setEditingId(null);
    setFormMode("create");
    setSelected(null);
  };

  const openEdit = (art) => {
    setForm({ title:art.title, category:art.category, content:art.content, isPinned:art.isPinned });
    setEditingId(art._id);
    setFormMode("edit");
    setSelected(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Title and content are required", "error"); return;
    }
    setSaving(true);
    try {
      if (isDemo) {
        if (formMode === "create") {
          const art = { _id:"V-"+Date.now(), ...form, createdBy:{ name:"Dana Whitfield", initials:"DW", color:"#2f6fdb" }, updatedAt:new Date().toISOString() };
          setArticles(prev => [art, ...prev]);
        } else {
          setArticles(prev => prev.map(a => a._id === editingId ? { ...a, ...form, updatedAt:new Date().toISOString() } : a));
        }
        showToast(`"${form.title}" ${formMode === "create" ? "created" : "updated"}`);
      } else {
        const token = localStorage.getItem("authToken");
        const url    = formMode === "create" ? `${API_URL}/api/vademecum` : `${API_URL}/api/vademecum/${editingId}`;
        const res    = await fetch(url, { method: formMode === "create" ? "POST" : "PUT", headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(form) });
        const data   = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        if (formMode === "create") setArticles(prev => [data, ...prev]);
        else setArticles(prev => prev.map(a => a._id === editingId ? data : a));
        showToast(`"${data.title}" ${formMode === "create" ? "created" : "updated"}`);
      }
      setFormMode(null); setEditingId(null);
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const art = articles.find(a => a._id === id);
    if (isDemo) {
      setArticles(prev => prev.filter(a => a._id !== id));
      if (selected === id) setSelected(null);
      showToast(`"${art?.title}" deleted`); return;
    }
    const token = localStorage.getItem("authToken");
    const res   = await fetch(`${API_URL}/api/vademecum/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
    if (res.ok) {
      setArticles(prev => prev.filter(a => a._id !== id));
      if (selected === id) setSelected(null);
      showToast(`"${art?.title}" deleted`);
    }
  };

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (selected) {
    const art = articles.find(a => a._id === selected);
    if (!art) { setSelected(null); return null; }
    const dateStr = art.updatedAt
      ? new Date(art.updatedAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })
      : "";
    return (
      <div className="page">
        <div style={{ marginBottom:20 }}>
          <Btn variant="ghost" icon="chevronLeft" sm onClick={() => setSelected(null)}>Back to Vademecum</Btn>
        </div>
        <Card style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:22, flexWrap:"wrap" }}>
            <div>
              <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
                {art.isPinned && <Badge tone="teal" dot>Pinned</Badge>}
                <Badge tone={CAT_TONE[art.category]||"gray"}>{art.category}</Badge>
              </div>
              <div style={{ fontSize:24, fontWeight:700, lineHeight:1.3, marginBottom:8 }}>{art.title}</div>
              <div className="muted" style={{ fontSize:14 }}>
                {art.createdBy?.name && <span>By <strong>{art.createdBy.name}</strong>{dateStr ? " · " : ""}</span>}
                {dateStr && <span>Updated {dateStr}</span>}
              </div>
            </div>
            {canManage && (
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn variant="ghost" icon="edit" sm onClick={() => openEdit(art)}>Edit</Btn>
                <Btn variant="ghost" icon="trash" sm onClick={() => handleDelete(art._id)}>Delete</Btn>
              </div>
            )}
          </div>
          <div style={{ borderTop:"1px solid var(--line-2)", paddingTop:24, fontSize:15.5 }}>
            {renderMd(art.content)}
          </div>
        </Card>
      </div>
    );
  }

  // ── FORM VIEW ────────────────────────────────────────────────────────────
  if (formMode) {
    return (
      <div className="page">
        <PageHead
          title={formMode === "create" ? "New Article" : "Edit Article"}
          sub={formMode === "create" ? "Add a new article to the vademecum" : `Editing: ${form.title || "…"}`}
          actions={<Btn variant="ghost" icon="chevronLeft" onClick={() => { setFormMode(null); setEditingId(null); }}>Cancel</Btn>}
        />
        <Card style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:"1 / -1" }}>
              <label className="fieldlabel">Title *</label>
              <input className="input" style={{ width:"100%" }} placeholder="e.g. Emergency Evacuation Protocol"
                value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} />
            </div>
            <div>
              <label className="fieldlabel">Category</label>
              <select className="input" style={{ width:"100%" }} value={form.category} onChange={e => setForm({ ...form, category:e.target.value })}>
                {VADM_CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:22 }}>
              <input type="checkbox" id="pin-chk" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned:e.target.checked })} style={{ width:16, height:16, cursor:"pointer" }} />
              <label htmlFor="pin-chk" style={{ fontSize:14.5, cursor:"pointer" }}>Pin to top of list</label>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="fieldlabel">Content * — Markdown supported</label>
            <div style={{ padding:"7px 12px", background:"var(--surface-2)", borderRadius:"var(--r-md) var(--r-md) 0 0", borderBottom:"1px solid var(--line-2)", fontSize:13, color:"var(--muted)", fontFamily:"var(--mono)" }}>
              ## Heading &nbsp;·&nbsp; **bold** &nbsp;·&nbsp; - bullet &nbsp;·&nbsp; 1. numbered
            </div>
            <textarea className="input" style={{ width:"100%", height:340, padding:"12px", resize:"vertical", fontFamily:"var(--mono)", fontSize:14, lineHeight:1.7, borderTopLeftRadius:0, borderTopRightRadius:0 }}
              placeholder={"## Section Title\n\nWrite your content here.\n\n## Steps\n1. First step\n2. Second step with **bold text**\n\n- Bullet point\n- Another point"}
              value={form.content} onChange={e => setForm({ ...form, content:e.target.value })} />
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:14, borderTop:"1px solid var(--line-2)" }}>
            <Btn variant="ghost" onClick={() => { setFormMode(null); setEditingId(null); }}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : formMode === "create" ? "Create Article" : "Save Changes"}
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <PageHead
        title="Vademecum"
        sub={`${articles.length} article${articles.length !== 1 ? "s" : ""} · Quick reference guides & procedures`}
        actions={canManage && <Btn variant="primary" icon="plus" onClick={openCreate}>New article</Btn>}
      />

      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search articles…" value={q} onChange={setQ} />
        <Select value={cat} options={VADM_CATS} onChange={setCat} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:14.5 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)" }}>
            <Icon name="alphabetical" size={34} style={{ marginBottom:14, opacity:.5 }} />
            <div style={{ fontSize:17, fontWeight:600, color:"var(--ink-2)", marginBottom:8 }}>
              {q || cat !== "All" ? "No articles match your search" : "No articles yet"}
            </div>
            <div style={{ fontSize:15 }}>
              {q || cat !== "All" ? "Try adjusting your search or filter." : canManage ? "Click \"New article\" to create the first one." : "Check back later."}
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--gap)" }}>
          {pinned.length > 0 && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", letterSpacing:".07em", textTransform:"uppercase", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <Icon name="pin" size={12} /> Pinned
              </div>
              <Card flush>
                {pinned.map(art => <VadRow key={art._id} art={art} onClick={() => setSelected(art._id)} />)}
              </Card>
            </div>
          )}
          {cat !== "All" ? (
            unpinned.length > 0 && (
              <Card flush>
                {unpinned.map(art => <VadRow key={art._id} art={art} onClick={() => setSelected(art._id)} />)}
              </Card>
            )
          ) : (
            VADM_CATS.filter(c => c !== "All").map(category => {
              const items = unpinned.filter(a => a.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", letterSpacing:".07em", textTransform:"uppercase", marginBottom:10 }}>
                    {category}
                  </div>
                  <Card flush>
                    {items.map(art => <VadRow key={art._id} art={art} onClick={() => setSelected(art._id)} />)}
                  </Card>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
