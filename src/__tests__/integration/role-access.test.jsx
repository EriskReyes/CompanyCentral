import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// In App.jsx, getAccess(role, route) uses the role-switcher state (defaults to "admin").
// To test role-based access we switch via the RoleSwitcher dropdown in the TopBar.

function setupAdmin() {
  // dev-mock-token makes isDemo=true so pages use static data instead of calling fetch
  localStorage.setItem('authToken', 'dev-mock-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'E-101', name: 'Dana Whitfield', role: 'admin', email: 'dana@test.io',
  }));
  localStorage.setItem('company', JSON.stringify({
    companyId: 'WC-ROLE', name: 'Role Corp', industry: 'Technology',
  }));
}

async function switchRoleTo(roleName) {
  // Open the role switcher dropdown
  const switcher = document.querySelector('.role-switch');
  await userEvent.click(switcher);
  // Click the desired role name inside the dropdown
  const options = screen.getAllByText(roleName);
  // The last one is in the dropdown (the first could be the active indicator)
  await userEvent.click(options[options.length - 1]);
}

async function navigateTo(hash) {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  // Give React time to process the state update
  await waitFor(() => {}, { timeout: 300 });
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
  Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
});

// ─── LockedPage component ─────────────────────────────────────────────────────
describe('LockedPage', () => {
  it('shows "Permission Required" heading when role has no access', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Guest');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('shows the page label in the locked message', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Employee');
    await navigateTo('invoices');
    await waitFor(() => {
      // The locked-page <strong> element holds the page label
      const label = document.querySelector('.locked-page strong');
      expect(label).toBeInTheDocument();
      expect(label.textContent.toLowerCase()).toContain('invoices');
    });
  });

  it('"Request Access" button changes to "Request Sent ✓" after click', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Employee');
    await navigateTo('invoices');
    await waitFor(() => screen.getByText('Request Access'));
    await userEvent.click(screen.getByText('Request Access'));
    // Use exact text to avoid matching the toast "Access Request Sent"
    expect(screen.getByText('Request Sent ✓')).toBeInTheDocument();
  });

  it('"Go to Dashboard" button navigates back to Dashboard', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Guest');
    await navigateTo('invoices');
    await waitFor(() => screen.getByText('Go to Dashboard'));
    await userEvent.click(screen.getByText('Go to Dashboard'));
    await waitFor(() => {
      const dashItem = screen.getAllByText('Dashboard')[0].closest('.nav-item');
      expect(dashItem).toHaveClass('active');
    });
  });
});

// ─── Invoices access ─────────────────────────────────────────────────────────
describe('Invoices page access', () => {
  it('admin (default role) can access invoices — no LockedPage', async () => {
    setupAdmin();
    render(<App />);
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('Employee role via switcher shows LockedPage for invoices', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Employee');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('Manager role via switcher shows LockedPage for invoices', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Manager');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('Guest role via switcher shows LockedPage for invoices', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Guest');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('HR role via switcher shows LockedPage for invoices', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('HR');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Employees page access ───────────────────────────────────────────────────
describe('Employees page access', () => {
  it('Admin role can access employees', async () => {
    setupAdmin();
    render(<App />);
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('Manager role has view access to employees (no LockedPage)', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Manager');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('Employee role shows LockedPage for employees page', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Employee');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('Guest role shows LockedPage for employees page', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Guest');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Dashboard access ─────────────────────────────────────────────────────────
describe('Dashboard access', () => {
  it('all roles can access dashboard — no LockedPage', async () => {
    const roleNames = ['Admin','Manager','HR','Team Leader','Employee','Guest'];
    setupAdmin();
    render(<App />);
    for (const roleName of roleNames) {
      await switchRoleTo(roleName);
      await navigateTo('dashboard');
      await waitFor(() => {
        expect(screen.queryByText('Permission Required')).toBeNull();
      }, { timeout: 1000 });
    }
  });
});

// ─── Reports access ───────────────────────────────────────────────────────────
describe('Reports page access', () => {
  it('Admin role has full access to reports', async () => {
    setupAdmin();
    render(<App />);
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('Manager role has view access to reports (no LockedPage)', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Manager');
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('Employee role shows LockedPage for reports', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Employee');
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Settings access ─────────────────────────────────────────────────────────
describe('Settings page access', () => {
  it('Admin can access Settings and sees Workspace tab', async () => {
    setupAdmin();
    render(<App />);
    await navigateTo('settings');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
    expect(screen.getByText('Workspace')).toBeInTheDocument();
  });

  it('Guest role can access Settings (view only)', async () => {
    setupAdmin();
    render(<App />);
    await switchRoleTo('Guest');
    await navigateTo('settings');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });
});
