import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

function setupAuth(role = 'admin') {
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'E-101', name: 'Dana Whitfield', role, email: 'dana@test.io',
  }));
  localStorage.setItem('company', JSON.stringify({
    companyId: 'WC-TEST', name: 'Test Corp', industry: 'Technology',
  }));
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
  });

  it('renders Sidebar when authenticated', () => {
    render(<App />);
    expect(screen.getByText('WorkCentral')).toBeInTheDocument();
  });

  it('renders TopBar with Dashboard title by default', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
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
    render(<App />);
    // Simulate opening mobile sidebar then navigating
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    // sidebar should be open
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('mobile-open');

    // Navigate
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => {
      const updatedSidebar = document.querySelector('.sidebar');
      expect(updatedSidebar).not.toHaveClass('mobile-open');
    });
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });
});

// ─── Role-based rendering ─────────────────────────────────────────────────────
describe('App role-based behavior', () => {
  it('employee sees LockedPage when accessing invoices', async () => {
    setupAuth('employee');
    render(<App />);
    // Navigate directly by changing hash
    window.location.hash = 'invoices';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Permission Required')).toBeInTheDocument();
    });
  });

  it('admin does NOT see LockedPage for invoices', async () => {
    setupAuth('admin');
    render(<App />);
    await userEvent.click(screen.getByText('Invoices'));
    await waitFor(() => {
      expect(screen.queryByText('Permission Required')).toBeNull();
    });
  });
});
