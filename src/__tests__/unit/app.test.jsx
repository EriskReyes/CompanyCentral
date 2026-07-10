import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

function setupAuth(role = 'admin') {
  // dev-mock-token makes isDemo=true so pages use static data instead of calling fetch
  localStorage.setItem('authToken', 'dev-mock-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'E-101', name: 'Dana Whitfield', role, email: 'dana@test.io',
  }));
  localStorage.setItem('company', JSON.stringify({
    companyId: 'WC-TEST', name: 'Test Corp', industry: 'Technology',
  }));
}

// Switch role-switcher in TopBar to a role by display name (e.g. 'Employee', 'Guest')
async function switchRoleTo(roleName) {
  await userEvent.click(document.querySelector('.role-switch'));
  const options = screen.getAllByText(roleName);
  await userEvent.click(options[options.length - 1]);
}

// ─── Unauthenticated state ────────────────────────────────────────────────────
describe('App (unauthenticated)', () => {
  it('renders Login when localStorage has no auth data', () => {
    render(<App />);
    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
  });

  it('renders Register when hash is #register', () => {
    window.location.hash = '#register';
    render(<App />);
    expect(screen.getByText('Create your workspace')).toBeInTheDocument();
  });
});

// ─── Authenticated state ──────────────────────────────────────────────────────
describe('App (authenticated)', () => {
  beforeEach(() => {
    setupAuth('admin');
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  it('renders Sidebar when authenticated', () => {
    render(<App />);
    // Brand name renders as Work<b>Central</b> — use .brand-name class
    expect(document.querySelector('.brand-name')).toBeInTheDocument();
    expect(document.querySelector('.brand-name').textContent).toBe('WorkCentral');
  });

  it('renders TopBar with Dashboard title by default', () => {
    const { container } = render(<App />);
    // 'Dashboard' appears in both topbar title and nav item — query the specific element
    const tbTitle = container.querySelector('.tb-title');
    expect(tbTitle).toBeInTheDocument();
    expect(tbTitle.textContent).toBe('Dashboard');
  });

  it('renders company name in topbar crumb', () => {
    render(<App />);
    expect(screen.getByText('/ Test Corp')).toBeInTheDocument();
  });

  it('renders company ID in sidebar', () => {
    render(<App />);
    expect(screen.getByText('WC-TEST')).toBeInTheDocument();
  });

  it('renders current user name in sidebar footer', () => {
    render(<App />);
    expect(screen.getByText('Dana Whitfield')).toBeInTheDocument();
  });

  it('navigates to Employees page when nav item is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => {
      expect(screen.getAllByText('Employees').length).toBeGreaterThan(0);
    });
  });

  it('navigates to Settings page when Settings nav item is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Settings'));
    await waitFor(() => {
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });
  });

  it('handleLogout clears localStorage and shows Login screen', async () => {
    render(<App />);
    // Open user menu and logout
    await userEvent.click(screen.getByText('Dana Whitfield'));
    await userEvent.click(screen.getByText('Sign out'));

    await waitFor(() => {
      expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
    });
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('company')).toBeNull();
  });

  it('navigate function closes mobile sidebar after navigation', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    render(<App />);
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    // sidebar should be open
    expect(document.querySelector('.sidebar')).toHaveClass('mobile-open');

    // Navigate
    await userEvent.click(screen.getByText('Tasks'));
    await waitFor(() => {
      expect(document.querySelector('.sidebar')).not.toHaveClass('mobile-open');
    });
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });
});

// ─── Role-based rendering ─────────────────────────────────────────────────────
describe('App role-based behavior', () => {
  beforeEach(() => {
    setupAuth('admin');
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  it('role-switcher "Employee" shows LockedPage for invoices', async () => {
    render(<App />);
    await switchRoleTo('Employee');
    window.location.hash = 'invoices';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('admin (default role-switcher) does NOT see LockedPage for invoices', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Invoices'));
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });

  it('role-switcher "Guest" shows LockedPage for employees', async () => {
    render(<App />);
    await switchRoleTo('Guest');
    window.location.hash = 'employees';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });
});
