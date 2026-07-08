import React, { useState } from 'react';
import { Icon } from '../icons';
import { Card, Stat, Progress, StatusBadge, Avatar, AvatarStack, Btn, Badge, Seg, PageHead } from '../ui';
import * as D from '../data';

function MiniProjectRow({ p, onOpen }) {
  return (
    <div className="lrow clickable" style={{ cursor:"pointer" }} onClick={() => onOpen("projects")}>
      <div className="tile-ico" style={{ background:"var(--surface-2)", border:"1px solid var(--line)", fontFamily:"var(--mono)", fontSize: 13, fontWeight:600, color:"var(--ink-2)" }}>{p.code.slice(0,3)}</div>
      <div className="lr-main">
        <div className="lr-title">{p.name}</div>
        <div className="lr-sub">{p.done}/{p.total} tasks · due {p.due}</div>
      </div>
      <div style={{ width:120 }}><Progress value={p.progress} thin /></div>
      <div className="mono" style={{ width:38, textAlign:"right", fontSize: 14.5, fontWeight:600 }}>{p.progress}%</div>
      <StatusBadge value={p.status} />
    </div>
  );
}

function DocRow({ d }) {
  const [bg, fg] = D.DOC_COLORS[d.kind] || ["#eef1f4","#475569"];
  return (
    <div className="lrow">
      <div className="tile-ico" style={{ background:bg, color:fg, fontFamily:"var(--mono)", fontSize: 12, fontWeight:700 }}>{d.kind}</div>
      <div className="lr-main">
        <div className="lr-title">{d.name}</div>
        <div className="lr-sub">{D.empById[d.owner]?.name.split(" ")[0]} · {d.updated}</div>
      </div>
      <Icon name="chevronRight" size={16} style={{ color:"var(--muted)" }} />
    </div>
  );
}

function MeetingRow({ m }) {
  return (
    <div className="lrow">
      <div className="tile-ico" style={{ background:"var(--accent-soft)", color:"var(--accent-ink)" }}><Icon name="meetings" size={18} /></div>
      <div className="lr-main">
        <div className="lr-title">{m.title}</div>
        <div className="lr-sub">{m.time} · {m.room}</div>
      </div>
      <AvatarStack ids={m.who} size={24} max={3} />
    </div>
  );
}

function AnnounceRow({ a }) {
  return (
    <div className="lrow" style={{ alignItems:"flex-start" }}>
      <Avatar id={a.author} size={32} />
      <div className="lr-main">
        <div className="lr-title" style={{ display:"flex", alignItems:"center", gap:7 }}>
          {a.pinned && <Icon name="pin" size={13} style={{ color:"var(--accent)" }} />}{a.title}
        </div>
        <div className="lr-sub" style={{ marginTop:4, lineHeight:1.5, whiteSpace:"normal", color:"var(--ink-3)" }}>{a.body}</div>
        <div className="lr-sub" style={{ marginTop:5 }}>{D.empById[a.author]?.name} · {a.time}</div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="feed">
      {D.ACTIVITY.map((a, i) => (
        <div className="feed-item" key={i}>
          <Avatar id={a.who} size={30} />
          <div style={{ flex:1 }}>
            <div className="fi-line"><b>{D.empById[a.who]?.name.split(" ")[0]} {D.empById[a.who]?.name.split(" ")[1]}</b> {a.action} <b>{a.target}</b></div>
            <div className="fi-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ role, currentUser, onNavigate, isDemo, company }) {
  const [range, setRange] = useState("This week");
  const ongoing = isDemo ? D.PROJ.filter(p => p.status !== "Completed") : [];
  const isEmployee = role === "employee";
  const isGuest = role === "guest";
  const first = (currentUser.firstName || currentUser.name || "there").split(" ")[0];

  if (!isDemo) {
    return (
      <div className="page">
        <PageHead
          title={`Welcome, ${first}!`}
          sub={`${company?.name || "Your workspace"} is ready. Start building your team.`}
        />
        <div className="grid cols-3" style={{ marginBottom:"var(--gap)" }}>
          {[
            { icon:"employees", label:"Add employees",    sub:"Invite your team members and assign roles",   page:"employees",   color:"#0d7d7d" },
            { icon:"projects",  label:"Create a project", sub:"Organize work and track progress",             page:"projects",    color:"#2f6fdb" },
            { icon:"departments",label:"Set up departments",sub:"Structure your company's teams",            page:"departments", color:"#6d54d6" },
          ].map(({ icon, label, sub, page, color }) => (
            <div key={page} className="card" style={{ padding:28, cursor:"pointer", display:"flex", flexDirection:"column", gap:14 }} onClick={() => onNavigate(page)}>
              <div style={{ width:48, height:48, borderRadius:"var(--r-lg)", background:color+"22", display:"grid", placeItems:"center" }}>
                <Icon name={icon} size={24} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>{label}</div>
                <div className="muted" style={{ fontSize:14.5, lineHeight:1.5 }}>{sub}</div>
              </div>
              <div style={{ color, fontWeight:600, fontSize:14.5, marginTop:"auto" }}>Get started →</div>
            </div>
          ))}
        </div>
        <div className="grid cols-2">
          {[
            { icon:"tasks",     label:"Tasks & projects",  sub:"Create your first task and assign it to a team member.", page:"tasks",    color:"#c2790a" },
            { icon:"clients",   label:"Add clients",       sub:"Track your clients and associated projects.",             page:"clients",  color:"#15935f" },
            { icon:"announcements",label:"Announcements",  sub:"Post your first company-wide announcement.",              page:"announcements", color:"#d4453e" },
            { icon:"settings",  label:"Workspace settings",sub:"Configure your company ID, plan and preferences.",        page:"settings", color:"#4f6d8e" },
          ].map(({ icon, label, sub, page, color }) => (
            <div key={page} className="card" style={{ padding:20, cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start" }} onClick={() => onNavigate(page)}>
              <div style={{ width:38, height:38, borderRadius:"var(--r-md)", background:color+"22", display:"grid", placeItems:"center", flexShrink:0 }}>
                <Icon name={icon} size={20} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize:15.5, fontWeight:600, marginBottom:3 }}>{label}</div>
                <div className="muted" style={{ fontSize:14, lineHeight:1.5 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const myTasks = D.TASKS.filter(t => t.assignee === currentUser.id && t.status !== "Done");
  const myProjects = D.PROJ.filter(p => p.members.includes(currentUser.id));

  const stats = isEmployee ? [
    { label:"My open tasks", value:myTasks.length || 4, icon:"tasks", tone:"teal", delta:"2 due today", deltaDir:"flat" },
    { label:"My projects", value:myProjects.length || 3, icon:"projects", tone:"blue", sub:"active" },
    { label:"Meetings today", value:2, icon:"meetings", tone:"violet", sub:"next at 14:00" },
    { label:"Unread messages", value:3, icon:"messages", tone:"amber", sub:"2 mentions" },
  ] : isGuest ? [
    { label:"Shared documents", value:5, icon:"documents", tone:"teal", sub:"available to you" },
    { label:"Public announcements", value:2, icon:"announcements", tone:"blue", sub:"this week" },
    { label:"Invited meetings", value:1, icon:"meetings", tone:"violet", sub:"upcoming" },
  ] : [
    { label:"Active employees", value:"142", icon:"employees", tone:"teal", delta:"+6", deltaDir:"up", sub:"vs last month" },
    { label:"Ongoing projects", value:ongoing.length, icon:"projects", tone:"blue", delta:"2 at risk", deltaDir:"flat" },
    { label:"Tasks due this week", value:"28", icon:"tasks", tone:"amber", delta:"-4", deltaDir:"down", sub:"vs last week" },
    { label:"Upcoming meetings", value:D.MEETINGS.length, icon:"meetings", tone:"violet", sub:"next 7 days" },
  ];

  return (
    <div className="page">
      <PageHead
        title={`Good morning, ${first}`}
        sub={isGuest ? "Here's the information shared with you." : "Here's what's happening across WorkCentral today."}
        actions={!isGuest && <>
          <Seg options={["Today","This week","This month"]} value={range} onChange={setRange} />
          {!isEmployee && <Btn variant="primary" icon="plus" onClick={() => onNavigate("projects")}>New project</Btn>}
        </>}
      />

      <div className={"grid " + (isGuest ? "cols-3" : "cols-4")} style={{ marginBottom:"var(--gap)" }}>
        {stats.map((s, i) => <Stat key={i} {...s} />)}
      </div>

      {isGuest ? (
        <div className="dash-split">
          <Card title="Shared with you" sub="Documents and files made available to guests" flush
            actions={<span className="link" onClick={() => onNavigate("documents")}>View all</span>}>
            {D.DOCS.filter(d => d.shared).slice(0,5).map(d => <DocRow key={d.id} d={d} />)}
          </Card>
          <div className="grid" style={{ gridTemplateColumns:"1fr" }}>
            <Card title="Public announcements" flush>
              {D.ANNOUNCE.slice(0,2).map(a => <AnnounceRow key={a.id} a={a} />)}
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="dash-split" style={{ marginBottom:"var(--gap)" }}>
            <Card title={isEmployee ? "My projects" : "Project progress"} sub={isEmployee ? "Projects you're a member of" : "Across all active projects"} flush
              actions={<span className="link" onClick={() => onNavigate("projects")}>View all<Icon name="chevronRight" size={14} /></span>}>
              {(isEmployee ? myProjects : ongoing).slice(0, isEmployee ? 4 : 5).map(p => <MiniProjectRow key={p.id} p={p} onOpen={onNavigate} />)}
            </Card>
            <Card title="Upcoming meetings" flush actions={<span className="link" onClick={() => onNavigate("meetings")}>Calendar</span>}>
              {D.MEETINGS.map((m, i) => <MeetingRow key={i} m={m} />)}
            </Card>
          </div>

          <div className="dash-split-2">
            <Card title={isEmployee ? "My tasks due this week" : "Team activity"} flush
              actions={isEmployee ? <span className="link" onClick={() => onNavigate("tasks")}>All tasks</span> : <Badge tone="green" dot>Live</Badge>}>
              {isEmployee
                ? (myTasks.length ? myTasks : D.TASKS.slice(0,5)).map(t => (
                    <div className="lrow" key={t.id}>
                      <div className="tile-ico" style={{ background:"var(--surface-2)", border:"1px solid var(--line)", color:"var(--accent)" }}><Icon name="tasks" size={17} /></div>
                      <div className="lr-main"><div className="lr-title">{t.title}</div><div className="lr-sub">{D.projById[t.proj]?.code} · due {t.due}</div></div>
                      <StatusBadge value={t.status} />
                    </div>))
                : <ActivityFeed />}
            </Card>
            <div className="grid" style={{ gridTemplateColumns:"1fr", gap:"var(--gap)" }}>
              <Card title="Latest documents" flush actions={<span className="link" onClick={() => onNavigate("documents")}>All</span>}>
                {D.DOCS.slice(0,4).map(d => <DocRow key={d.id} d={d} />)}
              </Card>
              <Card title="Recent announcements" flush actions={<span className="link" onClick={() => onNavigate("announcements")}>All</span>}>
                {D.ANNOUNCE.slice(0,2).map(a => <AnnounceRow key={a.id} a={a} />)}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
