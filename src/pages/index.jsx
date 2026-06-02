import Dashboard from './Dashboard';
import { Icon } from '../icons';
import { Btn } from '../ui';
import {
  Projects, Tasks, Employees, Departments, Teams, Schedule, Attendance,
  Documents, Files, Announcements, Clients, Invoices, Reports,
  Messages, Meetings, Notifications, Settings
} from './Pages';

export function LockedPage({ pageLabel, role, onNavigate, onRequestPermission }) {
  const [requested, setRequested] = React.useState(false);

  const handleRequest = () => {
    setRequested(true);
    if (onRequestPermission) onRequestPermission(pageLabel, role);
  };

  return (
    <div className="page">
      <div className="locked-page">
        <div className="locked-ico"><Icon name="lock" size={26} /></div>
        <h3>Permission Required</h3>
        <p>You need permission to access <strong>{pageLabel}</strong> as a {role}.</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Request access from an administrator to get started.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn variant="soft" onClick={() => onNavigate("dashboard")}>Go to Dashboard</Btn>
          <Btn variant="primary" onClick={handleRequest}>
            {requested ? "Request Sent ✓" : "Request Access"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export {
  Dashboard, Employees, Departments, Teams, Projects, Tasks, Schedule, Attendance,
  Documents, Files, Announcements, Clients, Invoices, Reports, Messages, Meetings,
  Notifications, Settings,
};
