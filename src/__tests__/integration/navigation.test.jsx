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
    companyId: 'WC-NAV', name: 'Nav Corp', industry: 'Technology',
  }));
}

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    setupAuth('admin');
    window.location.hash = '';
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
  });

  it('starts on Dashboard by default', () => {
    render(<App />);
    const dashItem = screen.getAllByText('Dashboard')[0].closest('.nav-item');
    expect(dashItem).toHaveClass('active');
  });

  it('navigates to Employees when nav item is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => {
      const empItem = screen.getAllByText('Employees')[0].closest('.nav-item');
      expect(empItem).toHaveClass('active');
    });
  });

  it('renders Employees page content after navigation', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => {
      // Employees page renders a page title or table
      expect(screen.getAllByText('Employees').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('navigates to Projects when nav item is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Projects'));
    await waitFor(() => {
      const projItem = screen.getAllByText('Projects')[0].closest('.nav-item');
      expect(projItem).toHaveClass('active');
    });
  });

  it('navigates to Settings page', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Settings'));
    await waitFor(() => {
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });
  });

  it('navigates to Tasks page', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Tasks'));
    await waitFor(() => {
      const taskItem = screen.getAllByText('Tasks')[0].closest('.nav-item');
      expect(taskItem).toHaveClass('active');
    });
  });

  it('navigates back to Dashboard after going to another page', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => screen.getAllByText('Employees'));
    await userEvent.click(screen.getAllByText('Dashboard')[0]);
    await waitFor(() => {
      const dashItem = screen.getAllByText('Dashboard')[0].closest('.nav-item');
      expect(dashItem).toHaveClass('active');
    });
  });

  it('clicking brand logo navigates to Dashboard', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => screen.getAllByText('Employees'));
    // Brand name renders as Work<b>Central</b> — click the .side-brand container directly
    await userEvent.click(document.querySelector('.side-brand'));
    await waitFor(() => {
      const dashItem = screen.getAllByText('Dashboard')[0].closest('.nav-item');
      expect(dashItem).toHaveClass('active');
    });
  });

  it('topbar collapse button toggles sidebar on desktop', async () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.app');
    expect(appDiv).not.toHaveAttribute('data-collapsed', 'true');

    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    expect(appDiv).toHaveAttribute('data-collapsed', 'true');

    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    expect(appDiv).toHaveAttribute('data-collapsed', 'false');
  });
});

describe('Mobile Sidebar Navigation', () => {
  beforeEach(() => {
    setupAuth('admin');
    window.location.hash = '';
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
  });

  it('sidebar does not have mobile-open class initially', () => {
    render(<App />);
    expect(document.querySelector('.sidebar')).not.toHaveClass('mobile-open');
  });

  it('clicking hamburger opens the mobile sidebar drawer', async () => {
    render(<App />);
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    await waitFor(() => {
      expect(document.querySelector('.sidebar')).toHaveClass('mobile-open');
    });
  });

  it('sidebar-overlay is visible when mobile drawer is open', async () => {
    render(<App />);
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    await waitFor(() => {
      expect(document.querySelector('.sidebar-overlay')).toBeInTheDocument();
    });
  });

  it('clicking overlay backdrop closes the mobile sidebar', async () => {
    render(<App />);
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    await waitFor(() => document.querySelector('.sidebar-overlay'));

    await userEvent.click(document.querySelector('.sidebar-overlay'));
    await waitFor(() => {
      expect(document.querySelector('.sidebar')).not.toHaveClass('mobile-open');
    });
  });

  it('navigating via sidebar closes the mobile drawer', async () => {
    render(<App />);
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    await waitFor(() => document.querySelector('.sidebar-overlay'));

    await userEvent.click(screen.getByText('Employees'));
    await waitFor(() => {
      expect(document.querySelector('.sidebar')).not.toHaveClass('mobile-open');
    });
  });
});
