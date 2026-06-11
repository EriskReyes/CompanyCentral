import React, { useState, useRef } from 'react';
import { Icon } from '../icons';
import { Card, Btn, Badge, StatusBadge, Priority, Progress, Avatar, AvatarStack, Person, Search, Select, Seg, Tabs, PageHead, EmptyState, BarChart, Donut, showToast } from '../ui';
import * as D from '../data';

// ========== PROJECTS ==========
export function Projects({ access }) {
  const [projects, setProjects] = useState(D.PROJ);
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
export function Tasks({ access, role, currentUser }) {
  const [tasks, setTasks] = useState(D.TASKS);
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
export function Employees() {
  const [employees, setEmployees] = useState(D.EMP);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", title: "", dept: "Engineering", team: "Platform", email: "" });

  const deptOpts = ["All", ...D.DEPT.map(d => d.name)];
  const list = employees.filter(e => (dept === "All" || e.dept === dept) && (q === "" || e.name.toLowerCase().includes(q.toLowerCase())));

  const handleAddEmployee = () => {
    if (!newEmp.name) return;
    const parts = newEmp.name.split(" ");
    const emp = {
      id: "E-" + (100 + employees.length + 1),
      name: newEmp.name,
      title: newEmp.title,
      dept: newEmp.dept,
      team: newEmp.team,
      status: "Active",
      type: "Full-time",
      loc: "Remote",
      joined: "Today",
      initials: (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase(),
      color: "#0ea5b7",
      email: newEmp.email || newEmp.name.toLowerCase().replace(/\s+/g, ".") + "@workcentral.io"
    };
    setEmployees([emp, ...employees]);
    setNewEmp({ name: "", title: "", dept: "Engineering", team: "Platform", email: "" });
    setShowAdd(false);
    showToast(`Employee "${emp.name}" added successfully`);
  };

  return (
    <div className="page">
      <PageHead title="Employees" sub={`${employees.length} team members`}
        actions={<Btn variant="primary" icon="plus" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "Add employee"}</Btn>} />

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="fieldlabel">Full Name</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. John Doe" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Email</label>
              <input className="input" type="email" style={{ width: "100%" }} placeholder="e.g. john@company.com" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="fieldlabel">Job Title</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Software Engineer" value={newEmp.title} onChange={e => setNewEmp({...newEmp, title: e.target.value})} />
            </div>
            <div>
              <label className="fieldlabel">Department</label>
              <select className="input" style={{ width: "100%" }} value={newEmp.dept} onChange={e => setNewEmp({...newEmp, dept: e.target.value})}>
                {D.DEPT.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="fieldlabel">Team</label>
              <input className="input" style={{ width: "100%" }} placeholder="e.g. Web" value={newEmp.team} onChange={e => setNewEmp({...newEmp, team: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddEmployee}>Add Employee</Btn>
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
        <table className="table">
          <thead><tr><th>Name</th><th>Title</th><th>Department</th><th>Team</th><th>Status</th><th>Email</th></tr></thead>
          <tbody>
            {list.map(e => (<tr key={e.id}>
              <td><Person id={e.id} /></td>
              <td style={{ fontSize: 15 }}>{e.title}</td>
              <td>{e.dept}</td>
              <td>{e.team}</td>
              <td><StatusBadge value={e.status} /></td>
              <td className="t-mono" style={{ fontSize: 14.5 }}>{e.email}</td>
            </tr>))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== DEPARTMENTS ==========
export function Departments() {
  const [departments, setDepartments] = useState(D.DEPT);
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
export function Teams() {
  return (
    <div className="page">
      <PageHead title="Teams" sub={`${D.TEAMS.length} teams`} />
      <div className="grid cols-2" style={{ marginBottom:"var(--gap)" }}>
        {D.TEAMS.map(t => (<Card key={t.name} title={t.name} sub={t.focus}
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
export function Documents() {
  const [q, setQ] = useState("");
  const list = D.DOCS.filter(d => q === "" || d.name.toLowerCase().includes(q.toLowerCase()));
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
      <PageHead title="Documents" sub={`${D.DOCS.length} documents`}
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
        {list.map(d => {
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
export function Files({ access }) {
  const folders = [
    { name:"Engineering", count:48, color:"#2f6fdb" }, { name:"Design Assets", count:126, color:"#0d7d7d" },
    { name:"Product Specs", count:31, color:"#6d54d6" }, { name:"People & HR", count:22, color:"#15935f" },
    { name:"Brand & Marketing", count:64, color:"#c2790a" }, { name:"Contracts", count:18, color:"#b3543f" },
  ];
  const uploadRef = useRef(null);

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
          <Btn variant="ghost" icon="folder">New folder</Btn>
          <input type="file" multiple ref={uploadRef} style={{ display: "none" }} onChange={handleUpload} />
          <Btn variant="primary" icon="upload" onClick={() => uploadRef.current?.click()}>Upload</Btn>
        </> : <Badge tone="gray" dot>Read-only</Badge>} />
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
            {D.DOCS.slice(0,6).map(d => {
              const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
              return <tr key={d.id} className="clickable"><td><div style={{ display:"flex", alignItems:"center", gap:11 }}><div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize: 11, fontWeight:700, width:30, height:30 }}>{d.kind}</div><span className="t-strong">{d.name}</span></div></td><td>{D.empById[d.owner]?.name.split(" ")[0]}</td><td className="t-mono" style={{ fontSize: 14.5 }}>{d.updated}</td><td className="t-mono" style={{ fontSize: 14.5 }}>{d.size}</td><td style={{ textAlign:"right" }}><div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}><Btn variant="ghost" sm icon="eye" onClick={(e) => { e.stopPropagation(); handleView(d); }} /><Btn variant="ghost" sm icon="download" onClick={(e) => { e.stopPropagation(); handleDownload(d); }} /></div></td></tr>;
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== ANNOUNCEMENTS ==========
export function Announcements() {
  const [announcements, setAnnouncements] = useState(D.ANNOUNCE);
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
export function Clients() {
  const [clients, setClients] = useState(D.CLIENTS);
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
export function Invoices() {
  const [invoices, setInvoices] = useState(D.INVOICES);
  const [showAdd, setShowAdd] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: D.CLIENTS[0]?.name || "", amount: "$0", due: "TBD", status: "Draft" });

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
    setNewInvoice({ client: D.CLIENTS[0]?.name || "", amount: "$0", due: "TBD", status: "Draft" });
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
              <select className="input" style={{ width: "100%" }} value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}>
                {D.CLIENTS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
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
export function Reports() {
  return (
    <div className="page">
      <PageHead title="Reports" />
      <div className="grid cols-2" style={{ marginBottom:"var(--gap)" }}>
        <Card title="Task Status" sub="Current distribution">
          <Donut data={D.REPORTS.taskStatus} size={160} center={D.REPORTS.taskStatus.reduce((s,d)=>s+d.val,0)} />
        </Card>
        <Card title="Weekly Activity" sub="Last 7 days">
          <BarChart data={D.REPORTS.weekly} />
        </Card>
      </div>
    </div>
  );
}

// ========== MESSAGES ==========
export function Messages({ currentUser }) {
  const [sel, setSel] = useState(D.THREADS[0].id);
  const [draft, setDraft] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);

  const t = D.THREADS.find(x => x.id === sel);

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

  return (
    <div style={{ display: "flex", height: "calc(100vh - 62px)", overflow: "hidden" }}>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", flex:1, overflow:"hidden", background: "var(--surface)" }}>
        {/* list */}
        <div style={{ borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", minHeight:0, background: "var(--surface-2)" }}>
          <div style={{ padding:"16px 14px", borderBottom:"1px solid var(--line-2)", background:"var(--surface)" }}><Search placeholder="Search messages…" style={{ minWidth:0, width:"100%" }} /></div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {D.THREADS.map(th => {
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

export function Meetings({ role }) {
  const guest = role === "guest";
  const list = guest ? D.MEETINGS.slice(0,1) : D.MEETINGS;
  return (
    <div className="page">
      <PageHead title="Meetings" sub={guest ? "Meetings you're invited to" : "Your upcoming meetings"}
        actions={!guest && <><Btn variant="ghost" icon="calendar">Calendar</Btn><Btn variant="primary" icon="plus">Schedule</Btn></>} />
      <div className="dash-split">
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
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
              <Btn variant="soft" sm icon="play">Join</Btn>
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
export function Notifications() {
  return (
    <div className="page">
      <PageHead title="Notifications" />
      <Card flush>
        {D.NOTIFS.map((n, i) => (<div key={i} className="lrow">
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

export function Settings({ role, currentUser, onOpenTweaks, company }) {
  const [tab, setTab] = useState("Profile");
  const [toggles, setToggles] = useState({ email:true, push:true, mentions:true, digest:false, twofa:true, sessions:false });
  const [teamMembers, setTeamMembers] = useState([
    { id: "E-101", name: "Dana Whitfield", email: "dana@company.com", role: "admin", status: "Active" },
    { id: "E-102", name: "Marcus Lindell", email: "marcus@company.com", role: "manager", status: "Active" },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "employee" });
  const photoUploadRef = useRef(null);
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
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}><Btn variant="ghost">Cancel</Btn><Btn variant="primary">Save changes</Btn></div>
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
          <SetRow title="Active sessions" sub="Sign out of all other active sessions."><Btn variant="ghost" sm>Manage</Btn></SetRow>
          <SetRow title="Password" sub="Last changed 3 months ago."><Btn variant="ghost" sm icon="lock">Change</Btn></SetRow>
          <SetRow title="Login alerts" sub="Email me about logins from new devices."><Toggle on={toggles.sessions} onClick={()=>tg("sessions")} /></SetRow>
        </Card>
      )}

      {tab === "Appearance" && (
        <Card title="Appearance">
          <SetRow title="Theme & accent color" sub="Customize colors, sidebar style and density from the live Tweaks panel."><Btn variant="soft" sm icon="sparkles" onClick={onOpenTweaks}>Open Tweaks</Btn></SetRow>
          <SetRow title="Interface language" sub="English (United States)"><Btn variant="ghost" sm>Change</Btn></SetRow>
          <SetRow title="Start page" sub="Page shown when you open WorkCentral."><Badge tone="gray">Dashboard</Badge></SetRow>
        </Card>
      )}

      {tab === "Workspace" && role === "admin" && (
        <Card title="Workspace" sub="Admin-only settings">
          <SetRow title="Workspace name" sub="Shown across the app and in emails."><input className="input" defaultValue={company?.name || "WorkCentral Inc."} /></SetRow>
          <SetRow title="Company ID" sub="Unique identifier for your workspace."><Badge tone="gray">{company?.companyId || "WC-2026-XXXX"}</Badge></SetRow>
          <SetRow title="Industry" sub="Your company's industry sector."><Badge tone="blue">{company?.industry || "Technology"}</Badge></SetRow>
          <SetRow title="Billing plan" sub="Business · renews Jan 2027"><Badge tone="green" dot>Active</Badge></SetRow>
          <SetRow title="Data export" sub="Export all workspace data."><Btn variant="ghost" sm icon="download">Export</Btn></SetRow>
        </Card>
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
                      <td style={{ textAlign:"right" }}><Btn variant="ghost" sm icon="trash" /></td>
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
export function Schedule({ role, currentUser }) {
  const [schedule, setSchedule] = useState(D.SCHEDULE);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting", day: 1, start: 9, len: 1 });

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
          <Btn variant="ghost" icon="chevronLeft" />
          <span style={{ fontSize: 15, fontWeight:600, minWidth:150, textAlign:"center" }}>Jun 2 – 6, 2026</span>
          <Btn variant="ghost" icon="chevronRight" />
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
  const statuses = ["Present","Remote","On leave","Late"];
  const rows = D.EMP.slice(0, 12).map((e, i) => {
    const st = e.status === "On leave" ? "On leave" : e.status === "Remote" ? "Remote" : (i % 7 === 0 ? "Late" : "Present");
    const cin = st === "On leave" ? "—" : st === "Late" ? "09:42" : (i % 2 ? "08:58" : "09:03");
    const hrs = st === "On leave" ? "—" : (7 + (i % 3) + (i % 2 ? 0.5 : 0)).toFixed(1) + "h";
    return { e, st, cin, hrs };
  });
  const present = rows.filter(r => r.st === "Present").length;
  const remote = rows.filter(r => r.st === "Remote").length;

  return (
    <div className="page">
      <PageHead title="Attendance" sub="Today · June 2, 2026"
        actions={access === "full" ? <><Btn variant="ghost" icon="download">Export</Btn><Btn variant="primary" icon="check">Mark attendance</Btn></> : <Badge tone="gray" dot>Read-only</Badge>} />
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
export function Dienstplan({ onNavigate }) {
  return (
    <div className="page">
      <PageHead title="Dienstplan" sub="Work schedule and shift planning" />
      <Card style={{ maxWidth:600, margin:"40px auto", textAlign:"center", padding:"60px 40px" }}>
        <Icon name="schedule" size={44} style={{ color:"var(--accent)", marginBottom:20 }} />
        <div style={{ fontSize: 22, fontWeight:600, marginBottom:12 }}>Dienstplan</div>
        <div style={{ fontSize: 16, color:"var(--ink-2)", lineHeight:1.6, marginBottom:32 }}>
          Manage team work schedules, shifts, and planning. Coming soon.
        </div>
        <Btn variant="primary" onClick={() => onNavigate("dashboard")}>Back to Dashboard</Btn>
      </Card>
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
export function Vademecum({ onNavigate }) {
  return (
    <div className="page">
      <PageHead title="Vademecum" sub="Quick reference guide and procedures" />
      <Card style={{ maxWidth:600, margin:"40px auto", textAlign:"center", padding:"60px 40px" }}>
        <Icon name="alphabetical" size={44} style={{ color:"var(--accent)", marginBottom:20 }} />
        <div style={{ fontSize: 22, fontWeight:600, marginBottom:12 }}>Vademecum</div>
        <div style={{ fontSize: 16, color:"var(--ink-2)", lineHeight:1.6, marginBottom:32 }}>
          Quick reference guide with procedures and important information. Coming soon.
        </div>
        <Btn variant="primary" onClick={() => onNavigate("dashboard")}>Back to Dashboard</Btn>
      </Card>
    </div>
  );
}
