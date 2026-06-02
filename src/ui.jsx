import React from 'react';
import { Icon } from './icons';
import { empById } from './data';

export function Avatar({ id, name, color, initials, size = 30, ring }) {
  const e = id ? empById[id] : null;
  const ini = initials || (e ? e.initials : (name ? name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?"));
  const c = color || (e ? e.color : "#6b7a8d");
  return (
    <div className="avatar" style={{ width: size, height: size, background: c, fontSize: size*0.4,
      ...(ring ? { boxShadow: `0 0 0 2px ${ring}` } : {}) }} title={name || (e ? e.name : "")}>
      {ini}
    </div>
  );
}

export function AvatarStack({ ids = [], max = 4, size = 28 }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map((id, i) => <Avatar key={id + i} id={id} size={size} />)}
      {extra > 0 && <div className="avatar-more" style={{ width: size, height: size, fontSize: size*0.36 }}>+{extra}</div>}
    </div>
  );
}

export function Person({ id, sub, size = 32 }) {
  const e = empById[id];
  if (!e) return <span className="muted">—</span>;
  return (
    <div className="person">
      <Avatar id={id} size={size} />
      <div className="p-meta">
        <div className="p-name">{e.name}</div>
        <div className="p-sub">{sub || e.title}</div>
      </div>
    </div>
  );
}

export function Badge({ tone = "gray", dot, children }) {
  return <span className={"badge badge-" + tone}>{dot && <span className="bd-dot" />}{children}</span>;
}

const STATUS_TONE = {
  "On track":"green","At risk":"amber","Delayed":"red","Completed":"teal","Planning":"blue",
  "Active":"green","Remote":"blue","On leave":"amber","Prospect":"violet","Churned":"gray",
  "Paid":"green","Pending":"amber","Overdue":"red","Draft":"gray",
  "Done":"green","In progress":"blue","In review":"violet","Todo":"gray","Blocked":"red",
  "Excellent":"green","Good":"teal","New":"blue","Lost":"gray",
};

export function StatusBadge({ value, dot = true }) {
  return <Badge tone={STATUS_TONE[value] || "gray"} dot={dot}>{value}</Badge>;
}

const PRIO_TONE = { Urgent:"red", High:"amber", Medium:"blue", Low:"gray" };
export function Priority({ value }) {
  return (
    <span className="badge" style={{ background:"transparent", padding:"2px 0", color:"var(--ink-2)", fontWeight:500 }}>
      <span className="bd-dot" style={{ background:`var(--${PRIO_TONE[value]==="red"?"red":PRIO_TONE[value]==="amber"?"amber":PRIO_TONE[value]==="blue"?"blue":"muted"})` }} />
      {value}
    </span>
  );
}

export function Progress({ value, color, thin }) {
  return <div className={"progress" + (thin ? " thin" : "")}><span style={{ width: value + "%", ...(color?{background:color}:{}) }} /></div>;
}

export function Btn({ variant = "ghost", sm, icon, iconRight, children, onClick, style, title }) {
  const cls = ["btn", "btn-" + variant, sm ? "btn-sm" : "", !children ? "btn-icon" : ""].join(" ");
  return (
    <button className={cls} onClick={onClick} style={style} title={title}>
      {icon && <Icon name={icon} size={sm ? 15 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sm ? 15 : 16} />}
    </button>
  );
}

export function Card({ title, sub, actions, flush, children, style, className = "" }) {
  return (
    <div className={"card " + className} style={style}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <div className="ch-title">{title}</div>}
            {sub && <div className="ch-sub">{sub}</div>}
          </div>
          <div className="ch-spacer" />
          {actions}
        </div>
      )}
      <div className={"card-body" + (flush ? " flush" : "")}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, icon, tone = "teal", delta, deltaDir = "up", sub }) {
  const toneMap = { teal:["var(--accent-soft)","var(--accent-ink)"], blue:["var(--blue-soft)","#235ab3"],
    green:["var(--green-soft)","#0d6b44"], amber:["var(--amber-soft)","#95590a"], violet:["var(--violet-soft)","#523fb0"], red:["var(--red-soft)","#a8312b"] };
  const [bg, fg] = toneMap[tone] || toneMap.teal;
  return (
    <div className="stat">
      <div className="st-top">
        <div className="st-ico" style={{ background: bg, color: fg }}><Icon name={icon} size={19} /></div>
        <div className="st-label">{label}</div>
      </div>
      <div className="st-val">{value}</div>
      <div className="st-foot">
        {delta && <span className={"delta " + deltaDir}><Icon name={deltaDir==="up"?"trendUp":deltaDir==="down"?"trendDown":"arrowRight"} size={14} />{delta}</span>}
        {sub && <span className="st-sub">{sub}</span>}
      </div>
    </div>
  );
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map(o => {
        const val = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        return <button key={val} className={val === value ? "on" : ""} onClick={() => onChange(val)}>{lab}</button>;
      })}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => {
        const val = typeof t === "string" ? t : t.value;
        const lab = typeof t === "string" ? t : t.label;
        return <button key={val} className={val === value ? "on" : ""} onClick={() => onChange(val)}>{lab}</button>;
      })}
    </div>
  );
}

export function Search({ placeholder = "Search…", value, onChange, style }) {
  return (
    <div className="search-inline" style={style}>
      <Icon name="search" size={16} />
      <input placeholder={placeholder} value={value || ""} onChange={e => onChange && onChange(e.target.value)} />
    </div>
  );
}

export function Select({ label, value, options, onChange }) {
  return (
    <label className="select">
      {label && <span className="sv-label">{label}:</span>}
      <select value={value} onChange={e => onChange && onChange(e.target.value)}
        style={{ border:0, background:"transparent", font:"inherit", color:"var(--ink)", outline:0, cursor:"pointer", appearance:"none", paddingRight:2 }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Icon name="chevronDown" size={15} style={{ color:"var(--muted)" }} />
    </label>
  );
}

export function BarChart({ data, max, alt }) {
  const m = max || Math.max(...data.map(d => d.v));
  return (
    <div className="barchart">
      {data.map((d, i) => (
        <div className="bc-col" key={i}>
          <div className={"bc-bar" + (alt && alt(d, i) ? " alt" : "")} style={{ height: (d.v / m * 100) + "%" }} title={d.v} />
          <div className="bc-lab">{d.d}</div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, size = 150, thickness = 22, center }) {
  const total = data.reduce((s, d) => s + d.val, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:24 }}>
      <svg width={size} height={size} style={{ flexShrink:0 }}>
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eef1f4" strokeWidth={thickness} />
          {data.map((d, i) => {
            const frac = d.val / total;
            const dash = frac * C;
            const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color}
              strokeWidth={thickness} strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />;
            offset += dash;
            return el;
          })}
        </g>
        {center && <text x="50%" y="48%" textAnchor="middle" fontSize="26" fontWeight="600" fontFamily="var(--mono)" fill="var(--ink)">{center}</text>}
        {center && <text x="50%" y="62%" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font)">total</text>}
      </svg>
      <div className="legend">
        {data.map((d, i) => (
          <div className="lg-row" key={i}>
            <span className="lg-dot" style={{ background: d.color }} />
            <span className="lg-name">{d.label}</span>
            <span className="lg-val">{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "info", title, children, action }) {
  return (
    <div className="empty-state">
      <div className="locked-ico"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function PageHead({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div className="ph-text">
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
