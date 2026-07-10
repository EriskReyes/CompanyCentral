import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

// All pages that admin can visit
const PAGES = [
  'dashboard', 'employees', 'departments', 'teams',
  'projects', 'tasks', 'schedule', 'attendance',
  'documents', 'files', 'announcements',
  'clients', 'invoices', 'reports',
  'messages', 'meetings', 'notifications', 'settings',
  'dienstplan', 'personalreglement', 'vademecum',
];

function setupAdmin() {
  localStorage.setItem('authToken', 'dev-mock-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'E-101',
    name: 'Dana Whitfield',
    role: 'admin',
    email: 'dana@workcentral.io',
  }));
  localStorage.setItem('company', JSON.stringify({
    companyId: 'WC-DEV-TEST',
    name: 'Development Inc.',
    industry: 'Technology',
  }));
}

describe('Pages smoke tests — admin (dev token)', () => {
  beforeEach(() => {
    setupAdmin();
    window.location.hash = '';
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  it.each(PAGES)('page "%s" renders without crashing', async (page) => {
    const { unmount } = render(<App />);

    window.location.hash = page;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    // Wait for the page to render something meaningful
    await waitFor(() => {
      // The page should not show "Permission Required" (admin has full access)
      expect(screen.queryByText('Permission Required')).toBeNull();
      // The sidebar should still be visible
      expect(screen.getByText('WorkCentral')).toBeInTheDocument();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    setupAdmin();
  });
});

describe('Pages smoke tests — employee (limited access)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('authToken', 'test-emp-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'E-103',
      name: 'Priya Raman',
      role: 'employee',
      email: 'priya@workcentral.io',
    }));
    localStorage.setItem('company', JSON.stringify({
      companyId: 'WC-SMOKE',
      name: 'Smoke Corp',
      industry: 'Technology',
    }));
    window.location.hash = '';
  });

  const ALLOWED_PAGES = ['dashboard','tasks','schedule','documents','messages','meetings','notifications','settings','vademecum'];

  it.each(ALLOWED_PAGES)('employee can access "%s" without LockedPage', async (page) => {
    const { unmount } = render(<App />);

    window.location.hash = page;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    localStorage.setItem('authToken', 'test-emp-token');
    localStorage.setItem('user', JSON.stringify({ id: 'E-103', name: 'Priya Raman', role: 'employee', email: 'priya@workcentral.io' }));
    localStorage.setItem('company', JSON.stringify({ companyId: 'WC-SMOKE', name: 'Smoke Corp', industry: 'Technology' }));
  });

  const BLOCKED_PAGES = ['invoices','reports','departments'];

  it.each(BLOCKED_PAGES)('employee sees LockedPage for "%s"', async (page) => {
    const { unmount } = render(<App />);

    window.location.hash = page;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    localStorage.setItem('authToken', 'test-emp-token');
    localStorage.setItem('user', JSON.stringify({ id: 'E-103', name: 'Priya Raman', role: 'employee', email: 'priya@workcentral.io' }));
    localStorage.setItem('company', JSON.stringify({ companyId: 'WC-SMOKE', name: 'Smoke Corp', industry: 'Technology' }));
  });
});

describe('Pages smoke tests — guest (view-only)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('authToken', 'guest-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'guest', name: 'Alex Guest', role: 'guest', email: 'guest@ext.com',
    }));
    localStorage.setItem('company', JSON.stringify({
      companyId: 'WC-GUEST', name: 'Guest Corp', industry: 'Technology',
    }));
    window.location.hash = '';
  });

  it('guest can view dashboard', async () => {
    render(<App />);
    window.location.hash = 'dashboard';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });
  });

  it('guest sees LockedPage for employees', async () => {
    render(<App />);
    window.location.hash = 'employees';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('guest sees LockedPage for invoices', async () => {
    render(<App />);
    window.location.hash = 'invoices';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('guest can view meetings', async () => {
    render(<App />);
    window.location.hash = 'meetings';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });
  });
});
