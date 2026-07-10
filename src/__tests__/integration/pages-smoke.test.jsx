import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Switch the TopBar role-switcher to any role by display name
async function switchRoleTo(roleName) {
  await userEvent.click(document.querySelector('.role-switch'));
  const options = screen.getAllByText(roleName);
  await userEvent.click(options[options.length - 1]);
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
      // The sidebar should still be visible — brand renders as Work<b>Central</b>
      expect(document.querySelector('.brand-name')).toBeInTheDocument();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    setupAdmin();
  });
});

describe('Pages smoke tests — employee role (limited access)', () => {
  beforeEach(() => {
    setupAdmin();
    window.location.hash = '';
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  const ALLOWED_PAGES = ['dashboard', 'tasks', 'schedule', 'documents', 'messages', 'meetings', 'notifications', 'settings', 'vademecum'];

  it.each(ALLOWED_PAGES)('employee role can access "%s" without LockedPage', async (page) => {
    const { unmount } = render(<App />);
    // Switch role-switcher to Employee (access check uses role-switcher state)
    await switchRoleTo('Employee');

    window.location.hash = page;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    setupAdmin();
  });

  const BLOCKED_PAGES = ['invoices', 'reports', 'departments'];

  it.each(BLOCKED_PAGES)('employee role sees LockedPage for "%s"', async (page) => {
    const { unmount } = render(<App />);
    // Switch role-switcher to Employee
    await switchRoleTo('Employee');

    window.location.hash = page;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });

    unmount();
    localStorage.clear();
    setupAdmin();
  });
});

describe('Pages smoke tests — guest role (view-only)', () => {
  beforeEach(() => {
    setupAdmin();
    window.location.hash = '';
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  it('guest role can view dashboard', async () => {
    render(<App />);
    await switchRoleTo('Guest');
    window.location.hash = 'dashboard';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });
  });

  it('guest role sees LockedPage for employees', async () => {
    render(<App />);
    await switchRoleTo('Guest');
    window.location.hash = 'employees';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('guest role sees LockedPage for invoices', async () => {
    render(<App />);
    await switchRoleTo('Guest');
    window.location.hash = 'invoices';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('guest role can view meetings', async () => {
    render(<App />);
    await switchRoleTo('Guest');
    window.location.hash = 'meetings';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    }, { timeout: 2000 });
  });
});
