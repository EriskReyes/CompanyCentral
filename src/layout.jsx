import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons';
import { Avatar } from './ui';
import { ROLES, getAccess, NAV } from './data';

function useClickOutside(ref, onClose) {
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
}

export function Sidebar({ active, onNavigate, collapsed, role, currentUser, company, onLogout, mobileOpen, onCloseMobile }) {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();
  useClickOutside(ref, () => setShowMenu(false));

  const roleObj = ROLES.find(r => r.key === role);
  return (
    <>
    {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="side-brand" onClick={() => onNavigate("dashboard")} style={{ cursor: "pointer" }}>
        <div className="brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7l3.5 11 3-7 2.5 7L18 7" /><path d="M19.5 5.5l1.5 13" opacity="0.5" />
          </svg>
        </div>
        <div className="brand-name">Work<b>Central</b></div>
      </div>

      {company && (
        <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--line)", fontSize: 13.5, color:"var(--muted)" }}>
          <div style={{ fontWeight:600, color:"var(--ink-2)", marginBottom:3 }}>{company.name}</div>
          <div style={{ fontSize: 12 }}>{company.companyId}</div>
        </div>
      )}

      <div className="side-scroll">
        {NAV.map(group => {
          const visibleItems = group.items.filter(item => getAccess(role, item.key) !== "none");
          if (visibleItems.length === 0) return null;
          return (
            <div className="nav-group" key={group.group}>
              <div className="nav-label">{group.group}</div>
              {visibleItems.map(item => {
                const acc = getAccess(role, item.key);
                const isActive = active === item.key;
                return (
                  <div key={item.key}
                    className={"nav-item" + (isActive ? " active" : "")}
                    onClick={() => onNavigate(item.key)}>
                    <Icon className="ni-icon" name={item.icon} size={18} />
                    <span className="ni-label">{item.label}</span>
                    {item.badge && <span className="ni-badge">{item.badge}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="side-foot">
        <div className="side-user" onClick={() => setShowMenu(!showMenu)} style={{ cursor:"pointer", position:"relative" }} ref={ref}>
          <Avatar id={currentUser.id} size={32} />
          <div className="su-meta">
            <div className="su-name">{currentUser.name}</div>
            <div className="su-role">{roleObj.name} · {currentUser.title?.length > 18 ? currentUser.title?.slice(0,18)+"…" : currentUser.title}</div>
          </div>
          <Icon className="su-caret" name="chevronDown" size={15} style={{ color:"var(--side-ink-dim)" }} />

          {showMenu && (
            <div style={{
              position:"absolute",
              bottom:"100%",
              left:0,
              right:0,
              marginBottom:8,
              background:"var(--surface)",
              border:"1px solid var(--line)",
              borderRadius:"var(--r-lg)",
              boxShadow:"var(--sh-lg)",
              zIndex:100,
              overflow:"hidden"
            }}>
              <div onClick={() => { onNavigate("settings"); setShowMenu(false); }} style={{ padding:"10px 14px", cursor:"pointer", fontSize: 15, borderBottom:"1px solid var(--line-2)", display:"flex", alignItems:"center", gap:8, color:"var(--ink)" }}>
                <Icon name="settings" size={16} />
                Settings
              </div>
              <div onClick={() => { onLogout(); setShowMenu(false); }} style={{ padding:"10px 14px", cursor:"pointer", fontSize: 15, display:"flex", alignItems:"center", gap:8, color:"var(--ink)" }}>
                <Icon name="logout" size={16} />
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

function RoleSwitcher({ role, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useClickOutside(ref, () => setOpen(false));
  const cur = ROLES.find(r => r.key === role);

  const menuStyle = {
    position:"absolute", top:"calc(100% + 8px)", right:0, width:300, background:"var(--surface)",
    border:"1px solid var(--line)", borderRadius:"var(--r-lg)", boxShadow:"var(--sh-lg)", zIndex:50, overflow:"hidden", paddingBottom:6,
  };

  return (
    <div style={{ position:"relative" }} ref={ref}>
      <div className="role-switch" onClick={() => setOpen(o => !o)}>
        <span className="rs-dot" style={{ background: cur.color }} />
        <div style={{ display:"flex", flexDirection:"column", lineHeight:1.15 }}>
          <span className="rs-label">Viewing as</span>
          <span className="rs-name">{cur.name}</span>
        </div>
        <Icon name="chevronDown" size={15} style={{ color:"var(--muted)", marginLeft:2 }} />
      </div>
      {open && (
        <div style={menuStyle}>
          <div style={{ padding:"10px 12px 8px", fontSize: 13, fontWeight:600, letterSpacing:".05em", textTransform:"uppercase", color:"var(--muted)" }}>Switch role</div>
          {ROLES.map(r => (
            <div key={r.key} onClick={() => { onChange(r.key); setOpen(false); }}
              style={{ display:"flex", gap:11, padding:"9px 12px", cursor:"pointer", alignItems:"flex-start",
                background: r.key === role ? "var(--accent-soft)" : "transparent" }}
              onMouseEnter={e => { if (r.key !== role) e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={e => { if (r.key !== role) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width:9, height:9, borderRadius:99, background:r.color, marginTop:4, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize: 15, fontWeight:600, color:"var(--ink)", display:"flex", alignItems:"center", gap:6 }}>
                  {r.name}
                  {r.key === role && <Icon name="check" size={14} style={{ color:"var(--accent-ink)" }} />}
                </div>
                <div style={{ fontSize: 13.5, color:"var(--ink-3)", marginTop:2, lineHeight:1.4 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopBar({ title, crumb, role, onRole, onToggleCollapse, onNavigate, company, onLogout, theme, onToggleTheme, onToggleMobileSidebar }) {
  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      onToggleMobileSidebar?.();
    } else {
      onToggleCollapse();
    }
  };
  return (
    <header className="topbar">
      <button className="tb-collapse" onClick={handleMenuClick} title="Toggle sidebar"><Icon name="panelLeft" size={18} /></button>
      <div>
        <div className="tb-title">{title}</div>
      </div>
      {crumb && <span className="tb-crumb">/ {crumb}</span>}
      <div className="tb-spacer" />
      <div className="tb-search" onClick={e => e.currentTarget.querySelector("input").focus()}>
        <Icon name="search" size={16} />
        <input placeholder="Search people, projects, docs…" />
        <span className="kbd-row"><kbd>⌘</kbd><kbd>K</kbd></span>
      </div>
      <RoleSwitcher role={role} onChange={onRole} />
      <button className="tb-icon-btn" title="Toggle theme" onClick={onToggleTheme}>
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>
      <button className="tb-icon-btn" title="Messages" onClick={() => onNavigate("messages")}><Icon name="messages" size={18} /></button>
      <button className="tb-icon-btn" title="Notifications" onClick={() => onNavigate("notifications")}>
        <Icon name="bell" size={18} /><span className="tb-dot" />
      </button>
    </header>
  );
}
