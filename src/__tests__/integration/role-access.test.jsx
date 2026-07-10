import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

function renderAs(role) {
  localStorage.clear();
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'E-101', name: 'Test User', role, email: 'test@co.io',
  }));
  localStorage.setItem('company', JSON.stringify({
    companyId: 'WC-ROLE', name: 'Role Corp', industry: 'Technology',
  }));
  return render(<App />);
}

async function navigateTo(key) {
  window.location.hash = key;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  await waitFor(() => {}, { timeout: 500 });
}

// ─── Locked page ─────────────────────────────────────────────────────────────
describe('LockedPage', () => {
  it('shows "Permission Required" heading when access is denied', async () => {
    renderAs('employee');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('shows the page label in the locked message', async () => {
    renderAs('employee');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText(/invoices/i)).toBeInTheDocument();
    });
  });

  it('"Request Access" button changes to "Request Sent ✓" after click', async () => {
    renderAs('employee');
    await navigateTo('invoices');
    await waitFor(() => screen.getByText('Request Access'));
    await userEvent.click(screen.getByText('Request Access'));
    expect(screen.getByText(/request sent/i)).toBeInTheDocument();
  });

  it('"Go to Dashboard" button navigates back to Dashboard', async () => {
    renderAs('employee');
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
  it('admin can access invoices (no LockedPage)', async () => {
    renderAs('admin');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('manager cannot access invoices', async () => {
    renderAs('manager');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('employee cannot access invoices', async () => {
    renderAs('employee');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('guest cannot access invoices', async () => {
    renderAs('guest');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('hr cannot access invoices', async () => {
    renderAs('hr');
    await navigateTo('invoices');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Employees page access ───────────────────────────────────────────────────
describe('Employees page access', () => {
  it('admin can access employees', async () => {
    renderAs('admin');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('hr has full access to employees', async () => {
    renderAs('hr');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('manager has view access to employees (no LockedPage)', async () => {
    renderAs('manager');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('employee cannot access employees page', async () => {
    renderAs('employee');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('guest cannot access employees page', async () => {
    renderAs('guest');
    await navigateTo('employees');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Dashboard access ─────────────────────────────────────────────────────────
describe('Dashboard access', () => {
  it('all roles including guest can access dashboard', async () => {
    for (const role of ['admin','manager','hr','lead','employee','guest']) {
      const { unmount } = renderAs(role);
      await navigateTo('dashboard');
      await waitFor(() => {
        expect(screen.queryByText('Permission Required')).toBeNull();
      }, { timeout: 1000 });
      unmount();
      localStorage.clear();
    }
  });
});

// ─── Reports access ───────────────────────────────────────────────────────────
describe('Reports page access', () => {
  it('admin has full access to reports', async () => {
    renderAs('admin');
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('manager has view access to reports (no LockedPage)', async () => {
    renderAs('manager');
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('employee cannot access reports', async () => {
    renderAs('employee');
    await navigateTo('reports');
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});

// ─── Settings access ─────────────────────────────────────────────────────────
describe('Settings page access', () => {
  it('all roles (including guest) can access settings', async () => {
    for (const role of ['admin','manager','hr','lead','employee','guest']) {
      const { unmount } = renderAs(role);
      await navigateTo('settings');
      await waitFor(() => {
        expect(screen.queryByText('Permission Required')).toBeNull();
      }, { timeout: 1000 });
      unmount();
      localStorage.clear();
    }
  });

  it('admin sees Workspace tab in settings', async () => {
    renderAs('admin');
    await navigateTo('settings');
    await waitFor(() => {
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });
  });
});
