import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, TopBar } from '../../layout';

const mockUser = { id: 'E-101', name: 'Dana Whitfield', title: 'VP Engineering', initials: 'DW', color: '#2f6fdb' };
const mockCompany = { companyId: 'WC-TEST-001', name: 'Test Corp' };

function renderSidebar(props = {}) {
  return render(
    <Sidebar
      active="dashboard"
      onNavigate={vi.fn()}
      collapsed={false}
      role="admin"
      currentUser={mockUser}
      company={mockCompany}
      onLogout={vi.fn()}
      mobileOpen={false}
      onCloseMobile={vi.fn()}
      {...props}
    />
  );
}

function renderTopBar(props = {}) {
  return render(
    <TopBar
      title="Dashboard"
      crumb="Test Corp"
      role="admin"
      onRole={vi.fn()}
      onToggleCollapse={vi.fn()}
      onNavigate={vi.fn()}
      company={mockCompany}
      onLogout={vi.fn()}
      theme="dark"
      onToggleTheme={vi.fn()}
      onToggleMobileSidebar={vi.fn()}
      {...props}
    />
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
describe('Sidebar', () => {
  it('renders the WorkCentral brand name', () => {
    const { container } = renderSidebar();
    const brand = container.querySelector('.brand-name');
    expect(brand).toBeInTheDocument();
    expect(brand.textContent).toBe('WorkCentral');
  });

  it('renders company name', () => {
    renderSidebar();
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
  });

  it('renders company ID', () => {
    renderSidebar();
    expect(screen.getByText('WC-TEST-001')).toBeInTheDocument();
  });

  it('renders Dashboard nav item for admin', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Employees nav item for admin', () => {
    renderSidebar();
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('renders Projects nav item for admin', () => {
    renderSidebar();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders Invoices nav item for admin', () => {
    renderSidebar();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('calls onNavigate when clicking a nav item', async () => {
    const onNavigate = vi.fn();
    renderSidebar({ onNavigate });
    await userEvent.click(screen.getByText('Employees'));
    expect(onNavigate).toHaveBeenCalledWith('employees');
  });

  it('applies active class to the active nav item', () => {
    renderSidebar({ active: 'employees' });
    const items = document.querySelectorAll('.nav-item');
    const activeItem = Array.from(items).find((el) => el.textContent.includes('Employees'));
    expect(activeItem).toHaveClass('active');
  });

  it('does not apply active class to inactive nav items', () => {
    renderSidebar({ active: 'dashboard' });
    const items = document.querySelectorAll('.nav-item');
    const projectsItem = Array.from(items).find((el) => el.textContent.includes('Projects'));
    expect(projectsItem).not.toHaveClass('active');
  });

  it('renders sidebar-overlay div when mobileOpen is true', () => {
    const { container } = renderSidebar({ mobileOpen: true });
    expect(container.querySelector('.sidebar-overlay')).toBeInTheDocument();
  });

  it('does not render sidebar-overlay when mobileOpen is false', () => {
    const { container } = renderSidebar({ mobileOpen: false });
    expect(container.querySelector('.sidebar-overlay')).not.toBeInTheDocument();
  });

  it('adds mobile-open class to aside when mobileOpen is true', () => {
    const { container } = renderSidebar({ mobileOpen: true });
    expect(container.querySelector('aside')).toHaveClass('mobile-open');
  });

  it('does not add mobile-open class when mobileOpen is false', () => {
    const { container } = renderSidebar({ mobileOpen: false });
    expect(container.querySelector('aside')).not.toHaveClass('mobile-open');
  });

  it('calls onCloseMobile when overlay is clicked', async () => {
    const onCloseMobile = vi.fn();
    const { container } = renderSidebar({ mobileOpen: true, onCloseMobile });
    await userEvent.click(container.querySelector('.sidebar-overlay'));
    expect(onCloseMobile).toHaveBeenCalledTimes(1);
  });

  it('hides Invoices for guest role', () => {
    renderSidebar({ role: 'guest' });
    expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
  });

  it('hides Employees for employee role', () => {
    renderSidebar({ role: 'employee' });
    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
  });

  it('renders user name in footer', () => {
    renderSidebar();
    expect(screen.getByText('Dana Whitfield')).toBeInTheDocument();
  });

  it('clicking brand navigates to dashboard', async () => {
    const onNavigate = vi.fn();
    const { container } = renderSidebar({ onNavigate });
    await userEvent.click(container.querySelector('.side-brand'));
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });
});

// ── TopBar ────────────────────────────────────────────────────────────────────
describe('TopBar', () => {
  it('renders page title', () => {
    renderTopBar({ title: 'Projects' });
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders crumb', () => {
    renderTopBar({ crumb: 'WorkCentral' });
    expect(screen.getByText('/ WorkCentral')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderTopBar();
    const btn = screen.getByTitle('Toggle theme');
    expect(btn).toBeInTheDocument();
  });

  it('calls onToggleTheme when theme button clicked', async () => {
    const onToggleTheme = vi.fn();
    renderTopBar({ onToggleTheme });
    await userEvent.click(screen.getByTitle('Toggle theme'));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleMobileSidebar on menu click when width <= 768', async () => {
    const onToggleMobileSidebar = vi.fn();
    const onToggleCollapse = vi.fn();
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    renderTopBar({ onToggleMobileSidebar, onToggleCollapse });
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    expect(onToggleMobileSidebar).toHaveBeenCalledTimes(1);
    expect(onToggleCollapse).not.toHaveBeenCalled();
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
  });

  it('calls onToggleCollapse on menu click when width > 768', async () => {
    const onToggleMobileSidebar = vi.fn();
    const onToggleCollapse = vi.fn();
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
    renderTopBar({ onToggleMobileSidebar, onToggleCollapse });
    await userEvent.click(screen.getByTitle('Toggle sidebar'));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    expect(onToggleMobileSidebar).not.toHaveBeenCalled();
  });

  it('renders notifications button', () => {
    renderTopBar();
    expect(screen.getByTitle('Notifications')).toBeInTheDocument();
  });

  it('calls onNavigate with messages when messages button clicked', async () => {
    const onNavigate = vi.fn();
    renderTopBar({ onNavigate });
    await userEvent.click(screen.getByTitle('Messages'));
    expect(onNavigate).toHaveBeenCalledWith('messages');
  });
});
