import { describe, it, expect } from 'vitest';
import { ROLES, NAV, getAccess, EMP, empById, DEPT, TEAMS, PROJ, projById, TASKS, DOCS } from '../../data';

describe('getAccess', () => {
  const allPages = ['dashboard','employees','departments','teams','projects','tasks','schedule','attendance','documents','files','announcements','clients','invoices','reports','messages','meetings','notifications','settings','dienstplan','personalreglement','vademecum'];

  it('admin has full access to every page', () => { allPages.forEach((p) => expect(getAccess('admin', p)).toBe('full')); });
  it('guest has view access to dashboard', () => expect(getAccess('guest', 'dashboard')).toBe('view'));
  it('guest has no access to invoices', () => expect(getAccess('guest', 'invoices')).toBe('none'));
  it('guest has no access to employees', () => expect(getAccess('guest', 'employees')).toBe('none'));
  it('employee has full access to tasks', () => expect(getAccess('employee', 'tasks')).toBe('full'));
  it('employee has no access to invoices', () => expect(getAccess('employee', 'invoices')).toBe('none'));
  it('employee has view access to documents', () => expect(getAccess('employee', 'documents')).toBe('view'));
  it('manager has view access to employees', () => expect(getAccess('manager', 'employees')).toBe('view'));
  it('manager has no access to invoices', () => expect(getAccess('manager', 'invoices')).toBe('none'));
  it('manager has view access to reports', () => expect(getAccess('manager', 'reports')).toBe('view'));
  it('hr has full access to employees', () => expect(getAccess('hr', 'employees')).toBe('full'));
  it('hr has full access to attendance', () => expect(getAccess('hr', 'attendance')).toBe('full'));
  it('hr has no access to invoices', () => expect(getAccess('hr', 'invoices')).toBe('none'));
  it('lead has view access to projects', () => expect(getAccess('lead', 'projects')).toBe('view'));
  it('lead has full access to tasks', () => expect(getAccess('lead', 'tasks')).toBe('full'));
  it('unknown page returns none', () => expect(getAccess('admin', 'nonexistent')).toBe('none'));
  it('unknown role returns none', () => { allPages.forEach((p) => expect(getAccess('superuser', p)).toBe('none')); });
  it('empty role returns none', () => expect(getAccess('', 'dashboard')).toBe('none'));
});

describe('ROLES', () => {
  it('has exactly 6 roles', () => expect(ROLES).toHaveLength(6));
  it.each(['admin','manager','hr','lead','employee','guest'])('role %s exists', (key) => {
    expect(ROLES.find((r) => r.key === key)).toBeDefined();
  });
  it('each role has key, name, color, desc', () => {
    ROLES.forEach((r) => ['key','name','color','desc'].forEach((f) => expect(r).toHaveProperty(f)));
  });
  it('role keys are unique', () => {
    const keys = ROLES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('NAV', () => {
  it('has navigation groups', () => expect(NAV.length).toBeGreaterThan(0));
  it('each group has group name and non-empty items', () => {
    NAV.forEach((g) => { expect(typeof g.group).toBe('string'); expect(g.items.length).toBeGreaterThan(0); });
  });
  it('each nav item has key, label, icon', () => {
    NAV.forEach((g) => g.items.forEach((i) => { expect(i).toHaveProperty('key'); expect(i).toHaveProperty('label'); expect(i).toHaveProperty('icon'); }));
  });
  it('contains expected pages', () => {
    const allKeys = NAV.flatMap((g) => g.items.map((i) => i.key));
    ['dashboard','employees','projects','tasks','settings','invoices'].forEach((k) => expect(allKeys).toContain(k));
  });
  it('nav item keys are unique', () => {
    const allKeys = NAV.flatMap((g) => g.items.map((i) => i.key));
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });
});

describe('EMP', () => {
  it('has 18 employees', () => expect(EMP).toHaveLength(18));
  it('each employee has required fields', () => {
    EMP.forEach((e) => ['id','name','title','dept','email','initials','color','status','joined'].forEach((f) => expect(e).toHaveProperty(f)));
  });
  it('initials are 1-2 uppercase chars', () => { EMP.forEach((e) => expect(e.initials).toMatch(/^[A-Z]{1,2}$/)); });
  it('emails end in @workcentral.io', () => { EMP.forEach((e) => expect(e.email).toMatch(/@workcentral\.io$/)); });
  it('employee IDs are unique', () => { const ids = EMP.map((e) => e.id); expect(new Set(ids).size).toBe(ids.length); });
  it('IDs follow E-NNN pattern', () => { EMP.forEach((e) => expect(e.id).toMatch(/^E-\d+$/)); });
});

describe('empById', () => {
  it('maps E-101 to Dana Whitfield', () => expect(empById['E-101'].name).toBe('Dana Whitfield'));
  it('contains all 18 employees', () => expect(Object.keys(empById)).toHaveLength(18));
  it('returns undefined for unknown ID', () => expect(empById['E-999']).toBeUndefined());
  it('all employees map to themselves', () => { EMP.forEach((e) => expect(empById[e.id]).toBe(e)); });
});

describe('DEPT', () => {
  it('has department entries', () => expect(DEPT.length).toBeGreaterThan(0));
  it('each dept has name, lead, count, color, open', () => {
    DEPT.forEach((d) => ['name','lead','count','color','open'].forEach((f) => expect(d).toHaveProperty(f)));
  });
  it('department leads are valid employee IDs', () => { DEPT.forEach((d) => expect(empById[d.lead]).toBeDefined()); });
  it('count is non-negative', () => { DEPT.forEach((d) => expect(d.count).toBeGreaterThanOrEqual(0)); });
});

describe('TEAMS', () => {
  it('has team entries', () => expect(TEAMS.length).toBeGreaterThan(0));
  it('each team has name, dept, lead, members, focus', () => {
    TEAMS.forEach((t) => { ['name','dept','lead','members','focus'].forEach((f) => expect(t).toHaveProperty(f)); expect(Array.isArray(t.members)).toBe(true); });
  });
  it('team leads are valid employee IDs', () => { TEAMS.forEach((t) => expect(empById[t.lead]).toBeDefined()); });
  it('team members are valid employee IDs', () => { TEAMS.forEach((t) => t.members.forEach((id) => expect(empById[id]).toBeDefined())); });
});

describe('PROJ', () => {
  it('has 8 projects', () => expect(PROJ).toHaveLength(8));
  it('each project has required fields', () => {
    PROJ.forEach((p) => ['id','name','code','status','progress','priority','lead','members'].forEach((f) => expect(p).toHaveProperty(f)));
  });
  it('progress is between 0 and 100', () => {
    PROJ.forEach((p) => { expect(p.progress).toBeGreaterThanOrEqual(0); expect(p.progress).toBeLessThanOrEqual(100); });
  });
  it('project IDs are unique', () => { const ids = PROJ.map((p) => p.id); expect(new Set(ids).size).toBe(ids.length); });
  it('completed project has 100% progress', () => { const c = PROJ.find((p) => p.status === 'Completed'); expect(c).toBeDefined(); expect(c.progress).toBe(100); });
});

describe('projById', () => {
  it('contains all 8 projects', () => expect(Object.keys(projById)).toHaveLength(8));
  it('maps PRJ-01 to Atlas Platform Migration', () => expect(projById['PRJ-01'].name).toBe('Atlas Platform Migration'));
});

describe('TASKS', () => {
  it('has task entries', () => expect(TASKS.length).toBeGreaterThan(0));
  it('each task has required fields', () => {
    TASKS.forEach((t) => { ['id','title','proj','assignee','status','priority','due','tags'].forEach((f) => expect(t).toHaveProperty(f)); expect(Array.isArray(t.tags)).toBe(true); });
  });
  it('task IDs are unique', () => { const ids = TASKS.map((t) => t.id); expect(new Set(ids).size).toBe(ids.length); });
  it('assignees are valid employee IDs', () => { TASKS.forEach((t) => expect(empById[t.assignee]).toBeDefined()); });
  it('statuses are valid', () => {
    const valid = new Set(['Todo','In progress','In review','Done','Blocked']);
    TASKS.forEach((t) => expect(valid.has(t.status)).toBe(true));
  });
  it('priorities are valid', () => {
    const valid = new Set(['Low','Medium','High','Urgent']);
    TASKS.forEach((t) => expect(valid.has(t.priority)).toBe(true));
  });
});

describe('DOCS', () => {
  it('has document entries', () => expect(DOCS.length).toBeGreaterThan(0));
  it('each doc has id, name, kind, owner, updated', () => {
    DOCS.forEach((d) => ['id','name','kind','owner','updated'].forEach((f) => expect(d).toHaveProperty(f)));
  });
});
