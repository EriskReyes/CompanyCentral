import React, { useState } from 'react';
import { Icon } from '../icons';
import { Card, Btn, Badge, StatusBadge, Priority, Progress, Avatar, AvatarStack, Person, Search, Select, Seg, Tabs, PageHead, EmptyState, BarChart, Donut } from '../ui';
import * as D from '../data';

// ========== PROJECTS ==========
export function Projects({ access }) {
  const [view, setView] = useState("List");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const canManage = access === "full";
  const list = D.PROJ.filter(p => (status === "All" || p.status === status) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase())));
  const cols = ["Planning","On track","At risk","Delayed","Completed"];

  return (
    <div className="page">
      <PageHead title="Projects" sub={`${D.PROJ.filter(p=>p.status!=="Completed").length} active · ${D.PROJ.length} total`}
        actions={<><Seg options={["List","Board"]} value={view} onChange={setView} />
          {canManage ? <Btn variant="primary" icon="plus">New project</Btn> : <Badge tone="gray" dot>Read-only</Badge>}
        </>} />
      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search projects…" value={q} onChange={setQ} />
        <Select value={status} options={["All","Planning","On track","At risk","Delayed","Completed"]} onChange={setStatus} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:12.5 }}>{list.length} projects</span>
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
                    <div className="tile-ico" style={{ background:"var(--surface-2)", border:"1px solid var(--line)", fontFamily:"var(--mono)", fontSize:10, fontWeight:700, color:"var(--accent-ink)", width:34, height:34 }}>{p.code.slice(0,3)}</div>
                    <div style={{ minWidth:0 }}><div className="t-strong" style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:230 }}>{p.name}</div><div className="muted" style={{ fontSize:11.5 }}>{p.id}{p.client && " · "+p.client}</div></div>
                  </div></td>
                  <td><Avatar id={p.lead} size={28} /></td>
                  <td>{p.team}</td>
                  <td><AvatarStack ids={p.members} size={26} max={3} /></td>
                  <td><div style={{ display:"flex", alignItems:"center", gap:9 }}><div style={{ flex:1 }}><Progress value={p.progress} thin /></div><span className="mono" style={{ fontSize:12, fontWeight:600, width:34, textAlign:"right" }}>{p.progress}%</span></div></td>
                  <td><Priority value={p.priority} /></td>
                  <td className="t-mono" style={{ fontSize:12.5 }}>{p.due}</td>
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
                <span className="muted mono" style={{ fontSize:12, marginLeft:"auto" }}>{items.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {items.map(p => (<div key={p.id} className="card" style={{ padding:13, boxShadow:"var(--sh-xs)", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                    <span className="mono" style={{ fontSize:10.5, fontWeight:700, color:"var(--accent-ink)" }}>{p.code}</span>
                    <Priority value={p.priority} />
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:10, lineHeight:1.3 }}>{p.name}</div>
                  <Progress value={p.progress} thin />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:11 }}>
                    <AvatarStack ids={p.members} size={24} max={3} />
                    <span className="muted" style={{ fontSize:11 }}>{p.due}</span>
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
  const [view, setView] = useState("Board");
  const [proj, setProj] = useState("All projects");
  const personal = access !== "full" || role === "employee";
  const projOpts = ["All projects", ...D.PROJ.map(p => p.name)];
  let base = D.TASKS;
  if (personal) base = base.filter(t => t.assignee === currentUser.id);
  const list = base.filter(t => proj === "All projects" || D.projById[t.proj]?.name === proj);
  const cols = ["Todo","In progress","In review","Blocked","Done"];

  return (
    <div className="page">
      <PageHead title={personal ? "My Tasks" : "Tasks"} sub={personal ? "Tasks assigned to you" : `${D.TASKS.length} tasks across all projects`}
        actions={<><Seg options={["Board","List"]} value={view} onChange={setView} />
          <Btn variant="primary" icon="plus">New task</Btn>
        </>} />
      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Select value={proj} options={projOpts} onChange={setProj} />
        {personal && <Badge tone="teal" dot>Showing your tasks</Badge>}
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:12.5 }}>{list.length} tasks</span>
      </div>
      {view === "Board" ? (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length},1fr)`, gap:14, alignItems:"start" }}>
          {cols.map(col => {
            const items = list.filter(t => t.status === col);
            return (<div key={col} style={{ background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:"var(--r-lg)", padding:10, minHeight:140 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 6px 10px" }}>
                <StatusBadge value={col} dot /><span className="muted mono" style={{ fontSize:12, marginLeft:"auto" }}>{items.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {items.map(t => (<div key={t.id} className="card" style={{ padding:12, boxShadow:"var(--sh-xs)", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span className="mono" style={{ fontSize:10, color:"var(--muted)" }}>{t.id}</span>
                    <Priority value={t.priority} />
                  </div>
                  <div style={{ fontSize:12.5, fontWeight:500, lineHeight:1.4, marginBottom:10 }}>{t.title}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                    {t.tags.map(tg => <span key={tg} className="tag-soft">{tg}</span>)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span className="mono muted" style={{ fontSize:10.5 }}>{D.projById[t.proj]?.code}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="muted" style={{ fontSize:11 }}>{t.due}</span>
                      <Avatar id={t.assignee} size={22} />
                    </div>
                  </div>
                </div>))}
                {items.length === 0 && <div style={{ padding:"16px 6px", textAlign:"center", color:"var(--muted)", fontSize:12 }}>No tasks</div>}
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
                <td><div className="t-strong">{t.title}</div><div className="muted mono" style={{ fontSize:11 }}>{t.id}</div></td>
                <td>{D.projById[t.proj]?.code}</td>
                <td><Avatar id={t.assignee} size={26} /></td>
                <td><div style={{ display:"flex", gap:5 }}>{t.tags.map(tg => <span key={tg} className="tag-soft">{tg}</span>)}</div></td>
                <td><Priority value={t.priority} /></td>
                <td className="t-mono" style={{ fontSize:12.5 }}>{t.due}</td>
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
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const deptOpts = ["All", ...D.DEPT.map(d => d.name)];
  const list = D.EMP.filter(e => (dept === "All" || e.dept === dept) && (q === "" || e.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="page">
      <PageHead title="Employees" sub={`${D.EMP.length} team members`}
        actions={<Btn variant="primary" icon="plus">Add employee</Btn>} />
      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search employees…" value={q} onChange={setQ} />
        <Select value={dept} options={deptOpts} onChange={setDept} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:12.5 }}>{list.length} employees</span>
      </div>
      <Card flush>
        <table className="table">
          <thead><tr><th>Name</th><th>Title</th><th>Department</th><th>Team</th><th>Status</th><th>Email</th></tr></thead>
          <tbody>
            {list.map(e => (<tr key={e.id}>
              <td><Person id={e.id} /></td>
              <td style={{ fontSize:13 }}>{e.title}</td>
              <td>{e.dept}</td>
              <td>{e.team}</td>
              <td><StatusBadge value={e.status} /></td>
              <td className="t-mono" style={{ fontSize:12.5 }}>{e.email}</td>
            </tr>))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== DEPARTMENTS ==========
export function Departments() {
  return (
    <div className="page">
      <PageHead title="Departments" sub={`${D.DEPT.length} departments`}
        actions={<Btn variant="primary" icon="plus">New department</Btn>} />
      <div className="grid cols-3" style={{ marginBottom:"var(--gap)" }}>
        {D.DEPT.map(d => (<Card key={d.name} title={d.name} sub={`${d.count} people · ${d.open} open positions`}
          actions={<Avatar id={d.lead} size={28} />}>
          <div style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.6 }}>
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
          <div style={{ fontSize:13, lineHeight:1.8 }}>
            <div><span className="muted">Department:</span> {t.dept}</div>
            <div><span className="muted">Members:</span></div>
            {t.members.map(m => <div key={m} className="muted" style={{ fontSize:12, paddingLeft:16 }}>→ {D.empById[m]?.name}</div>)}
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

  return (
    <div className="page">
      <PageHead title="Documents" sub={`${D.DOCS.length} documents`}
        actions={<Btn variant="primary" icon="plus">Upload</Btn>} />
      <div className="filterbar" style={{ marginBottom:"var(--gap)" }}>
        <Search placeholder="Search documents…" value={q} onChange={setQ} />
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:12.5 }}>{list.length} documents</span>
      </div>
      <Card flush>
        {list.map(d => {
          const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
          return (<div key={d.id} className="lrow">
            <div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize:10, fontWeight:700 }}>{d.kind}</div>
            <div className="lr-main">
              <div className="lr-title">{d.name}</div>
              <div className="lr-sub">{D.empById[d.owner]?.name} · {d.updated}</div>
            </div>
            <div style={{ color:"var(--muted)", fontSize:12 }}>{d.size}</div>
            <Badge tone={d.shared ? "green" : "gray"} dot>{d.shared ? "Shared" : "Private"}</Badge>
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
  return (
    <div className="page">
      <PageHead title="Files" sub="Shared company file storage · 2.4 GB of 10 GB used"
        actions={access === "full" ? <><Btn variant="ghost" icon="folder">New folder</Btn><Btn variant="primary" icon="upload">Upload</Btn></> : <Badge tone="gray" dot>Read-only</Badge>} />
      <div className="ch-title" style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"var(--ink-2)" }}>Folders</div>
      <div className="grid cols-3" style={{ marginBottom:"calc(var(--gap) + 6px)" }}>
        {folders.map(f => (
          <div className="card" key={f.name} style={{ padding:16, display:"flex", alignItems:"center", gap:13, cursor:"pointer" }}>
            <div className="tile-ico" style={{ background:f.color+"1a", color:f.color, width:44, height:44 }}><Icon name="folder" size={22} /></div>
            <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{f.name}</div><div className="muted" style={{ fontSize:12 }}>{f.count} files</div></div>
            <Icon name="chevronRight" size={18} style={{ color:"var(--muted)" }} />
          </div>
        ))}
      </div>
      <Card title="Recent files" flush>
        <table className="table">
          <thead><tr><th>Name</th><th>Owner</th><th>Modified</th><th>Size</th></tr></thead>
          <tbody>
            {D.DOCS.slice(0,6).map(d => {
              const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
              return <tr key={d.id} className="clickable"><td><div style={{ display:"flex", alignItems:"center", gap:11 }}><div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize:9, fontWeight:700, width:30, height:30 }}>{d.kind}</div><span className="t-strong">{d.name}</span></div></td><td>{D.empById[d.owner]?.name.split(" ")[0]}</td><td className="t-mono" style={{ fontSize:12.5 }}>{d.updated}</td><td className="t-mono" style={{ fontSize:12.5 }}>{d.size}</td></tr>;
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ========== ANNOUNCEMENTS ==========
export function Announcements() {
  return (
    <div className="page">
      <PageHead title="Announcements" sub={`${D.ANNOUNCE.length} announcements`}
        actions={<Btn variant="primary" icon="plus">New announcement</Btn>} />
      <div className="grid cols-1" style={{ maxWidth:600 }}>
        {D.ANNOUNCE.map(a => (<Card key={a.id} title={<div style={{ display:"flex", alignItems:"center", gap:7 }}>{a.pinned && <Icon name="pin" size={13} style={{ color:"var(--accent)" }} />}{a.title}</div>}
          sub={D.empById[a.author]?.name + " · " + a.time}>
          <div style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.6, marginBottom:12 }}>{a.body}</div>
          <Badge tone="gray" dot>{a.dept}</Badge>
        </Card>))}
      </div>
    </div>
  );
}

// ========== CLIENTS ==========
export function Clients() {
  return (
    <div className="page">
      <PageHead title="Clients" sub={`${D.CLIENTS.length} clients`}
        actions={<Btn variant="primary" icon="plus">New client</Btn>} />
      <Card flush>
        <table className="table">
          <thead><tr><th>Client</th><th>Industry</th><th>Contact</th><th>Projects</th><th>Health</th><th>MRR</th><th>Status</th></tr></thead>
          <tbody>
            {D.CLIENTS.map(c => (<tr key={c.id}>
              <td><div className="t-strong">{c.name}</div><div className="muted" style={{ fontSize:11.5 }}>{c.id}</div></td>
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
  return (
    <div className="page">
      <PageHead title="Invoices" sub={`${D.INVOICES.length} invoices`}
        actions={<Btn variant="primary" icon="plus">New invoice</Btn>} />
      <Card flush>
        <table className="table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Issued</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {D.INVOICES.map(i => (<tr key={i.id}>
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
  const t = D.THREADS.find(x => x.id === sel);
  return (
    <div className="page" style={{ paddingBottom:30 }}>
      <PageHead title="Messages" sub="Direct messages and team chats" />
      <div className="card" style={{ display:"grid", gridTemplateColumns:"300px 1fr", height:"calc(100vh - 210px)", minHeight:460, overflow:"hidden", padding:0 }}>
        {/* list */}
        <div style={{ borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", minHeight:0 }}>
          <div style={{ padding:12, borderBottom:"1px solid var(--line-2)" }}><Search placeholder="Search messages…" style={{ minWidth:0, width:"100%" }} /></div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {D.THREADS.map(th => {
              const e = D.empById[th.id];
              return (
                <div key={th.id} onClick={() => setSel(th.id)} style={{ display:"flex", gap:11, padding:"12px 14px", cursor:"pointer", borderBottom:"1px solid var(--line-2)", background: sel===th.id ? "var(--accent-soft)" : "transparent" }}>
                  <div style={{ position:"relative" }}>
                    <Avatar id={th.id} size={40} />
                    {th.online && <span style={{ position:"absolute", bottom:0, right:0, width:11, height:11, borderRadius:99, background:"var(--green)", border:"2px solid var(--surface)" }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}><span style={{ fontSize:13, fontWeight:600 }}>{e?.name}</span><span className="muted" style={{ fontSize:11 }}>{th.time}</span></div>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginTop:3 }}>
                      <span className="muted" style={{ fontSize:12, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{th.last}</span>
                      {th.unread > 0 && <span className="ni-badge" style={{ background:"var(--accent)" }}>{th.unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* thread */}
        <div style={{ display:"flex", flexDirection:"column", minHeight:0, background:"var(--surface-2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 18px", borderBottom:"1px solid var(--line)", background:"var(--surface)" }}>
            <Avatar id={sel} size={34} />
            <div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:600 }}>{D.empById[sel]?.name}</div><div className="muted" style={{ fontSize:11.5 }}>{t.online ? "Online" : "Offline"} · {D.empById[sel]?.title}</div></div>
            <Btn variant="ghost" sm icon="phone" /><Btn variant="ghost" sm icon="meetings" />
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 18px", display:"flex", flexDirection:"column", gap:12 }}>
            {t.msgs.map((m, i) => {
              const mine = m[0] === "me";
              return (
                <div key={i} style={{ display:"flex", gap:9, flexDirection: mine?"row-reverse":"row", alignItems:"flex-end" }}>
                  <Avatar id={mine ? currentUser.id : m[0]} size={26} />
                  <div style={{ maxWidth:"68%" }}>
                    <div style={{ background: mine ? "var(--accent)" : "var(--surface)", color: mine ? "#fff" : "var(--ink)", border: mine?"none":"1px solid var(--line)", padding:"9px 13px", borderRadius:14, borderBottomRightRadius: mine?4:14, borderBottomLeftRadius: mine?14:4, fontSize:13, lineHeight:1.5 }}>{m[1]}</div>
                    <div className="muted" style={{ fontSize:10.5, marginTop:4, textAlign: mine?"right":"left" }}>{m[2]}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:14, borderTop:"1px solid var(--line)", background:"var(--surface)", display:"flex", gap:10, alignItems:"center" }}>
            <Btn variant="ghost" icon="paperclip" />
            <input className="input" style={{ flex:1, cursor:"text" }} placeholder="Write a message…" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")setDraft("");}} />
            <Btn variant="primary" icon="arrowRight" onClick={()=>setDraft("")} />
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
        {days.map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, color:"var(--muted)", fontWeight:600 }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((c,i)=>(
          <div key={i} style={{ aspectRatio:"1", display:"grid", placeItems:"center", fontSize:12, borderRadius:8,
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
                <div style={{ fontSize:11, fontWeight:600, color:"var(--accent-ink)", textTransform:"uppercase" }}>{m.time.split(" · ")[0]}</div>
                <div className="mono" style={{ fontSize:17, fontWeight:700, color:"var(--accent-ink)", marginTop:2 }}>{m.time.split(" · ")[1]}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14.5, fontWeight:600 }}>{m.title}</div>
                <div className="muted" style={{ fontSize:12.5, marginTop:3, display:"flex", alignItems:"center", gap:6 }}><Icon name="meetings" size={14} /> {m.room} · {m.who.length} attendees</div>
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
            <div className="lr-sub" style={{ marginTop:6, fontSize:11 }}>{n.time}</div>
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

export function Settings({ role, currentUser, onOpenTweaks }) {
  const [tab, setTab] = useState("Profile");
  const [toggles, setToggles] = useState({ email:true, push:true, mentions:true, digest:false, twofa:true, sessions:false });
  const tg = k => setToggles(s => ({ ...s, [k]: !s[k] }));
  const roleObj = D.ROLES.find(r => r.key === role);
  const tabs = ["Profile","Notifications","Security","Appearance"].concat(role === "admin" ? ["Workspace"] : []);

  return (
    <div className="page" style={{ maxWidth:980 }}>
      <PageHead title="Settings" sub="Manage your account and workspace preferences" />
      <div style={{ marginBottom:"var(--gap)" }}><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>

      {tab === "Profile" && (
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:16, paddingBottom:20, borderBottom:"1px solid var(--line-2)", marginBottom:6 }}>
            <Avatar id={currentUser.id} size={64} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:600 }}>{currentUser.name}</div>
              <div className="muted" style={{ fontSize:13 }}>{currentUser.title} · {currentUser.email || "guest@external.com"}</div>
              <div style={{ marginTop:8 }}><Badge tone="teal" dot>{roleObj.name}</Badge></div>
            </div>
            <Btn variant="ghost" icon="upload">Change photo</Btn>
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
          <SetRow title="Workspace name" sub="Shown across the app and in emails."><input className="input" defaultValue="WorkCentral Inc." /></SetRow>
          <SetRow title="Members & roles" sub="142 members · 6 role types"><Btn variant="ghost" sm icon="employees">Manage</Btn></SetRow>
          <SetRow title="Billing plan" sub="Business · renews Jan 2027"><Badge tone="green" dot>Active</Badge></SetRow>
          <SetRow title="Data export" sub="Export all workspace data."><Btn variant="ghost" sm icon="download">Export</Btn></SetRow>
        </Card>
      )}
    </div>
  );
}

// ========== SCHEDULE (stub) ==========
export function Schedule({ role, currentUser }) {
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
  const events = personal ? D.SCHEDULE.filter(e => e.who === currentUser.id || ["meeting"].includes(e.type)) : D.SCHEDULE;

  return (
    <div className="page">
      <PageHead title="Schedule" sub={personal ? "Your week at a glance" : "Team schedule and meetings"}
        actions={<>
          <Btn variant="ghost" icon="chevronLeft" />
          <span style={{ fontSize:13, fontWeight:600, minWidth:150, textAlign:"center" }}>Jun 2 – 6, 2026</span>
          <Btn variant="ghost" icon="chevronRight" />
          <Btn variant="primary" icon="plus">Event</Btn>
        </>} />
      <Card flush>
        <div style={{ overflowX:"auto" }}>
          <div style={{ minWidth:760 }}>
            {/* header */}
            <div style={{ display:"grid", gridTemplateColumns:`64px repeat(5,1fr)`, borderBottom:"1px solid var(--line)" }}>
              <div />
              {DAYS.map((d, i) => (
                <div key={d} style={{ padding:"12px 10px", textAlign:"center", borderLeft:"1px solid var(--line-2)" }}>
                  <div style={{ fontSize:11.5, color:"var(--muted)", fontWeight:600, letterSpacing:".04em" }}>{d.toUpperCase()}</div>
                  <div style={{ fontSize:18, fontWeight:600, marginTop:2, color: i===1?"var(--accent)":"var(--ink)" }}>{DATES[i]}</div>
                </div>
              ))}
            </div>
            {/* grid */}
            <div style={{ display:"grid", gridTemplateColumns:`64px repeat(5,1fr)`, position:"relative" }}>
              {/* hours col */}
              <div>
                {Array.from({ length: endH - startH }).map((_, i) => (
                  <div key={i} style={{ height:hourH, fontSize:11, color:"var(--muted)", textAlign:"right", paddingRight:9, transform:"translateY(-6px)", fontFamily:"var(--mono)" }}>{startH + i}:00</div>
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
                        <div style={{ fontSize:11.5, fontWeight:600, color:fg, lineHeight:1.25 }}>{e.title}</div>
                        <div style={{ fontSize:10.5, color:fg, opacity:.8, marginTop:2 }}>{Math.floor(e.start)}:{(e.start%1?"30":"00")} · {D.empById[e.who]?.name.split(" ")[0]}</div>
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
