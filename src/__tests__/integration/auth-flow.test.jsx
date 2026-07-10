import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

const MOCK_USER = { id: 'E-101', name: 'Dana Whitfield', role: 'admin', email: 'dana@workcentral.io' };
const MOCK_COMPANY = { companyId: 'WC-TEST-001', name: 'Test Corp', industry: 'Technology' };

function mockFetchOk(data) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFail(message = 'Invalid credentials') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: message }),
  });
}

describe('Auth Flow — Email Login', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders Login form when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
  });

  it('sends email + password to /api/auth/login on submit', async () => {
    mockFetchOk({ token: 'tok', user: MOCK_USER, company: MOCK_COMPANY });
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'dana@workcentral.io');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'dana@workcentral.io', password: 'secret123' }),
        })
      );
    });
  });

  it('shows Dashboard sidebar after successful email login', async () => {
    mockFetchOk({ token: 'tok', user: MOCK_USER, company: MOCK_COMPANY });
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'dana@workcentral.io');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Brand name renders as Work<b>Central</b> — use .brand-name class
      expect(document.querySelector('.brand-name')).toBeInTheDocument();
    });
    expect(screen.getByText('WC-TEST-001')).toBeInTheDocument();
  });

  it('stores token, user, company in localStorage after login', async () => {
    mockFetchOk({ token: 'my-token', user: MOCK_USER, company: MOCK_COMPANY });
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'dana@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('my-token');
    });
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(MOCK_USER);
    expect(JSON.parse(localStorage.getItem('company'))).toEqual(MOCK_COMPANY);
  });

  it('shows error message when login fails', async () => {
    mockFetchFail('Wrong email or password');
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'bad@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Wrong email or password')).toBeInTheDocument();
    });
    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
  });

  it('clears error when switching login modes', async () => {
    mockFetchFail('Error');
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'x@x.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => screen.getByText('Error'));

    await userEvent.click(screen.getByText('Employee Code'));
    expect(screen.queryByText('Error')).toBeNull();
  });
});

describe('Auth Flow — Employee Login', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('sends companyId, employeeCode, password to employee-login endpoint', async () => {
    mockFetchOk({ token: 'emp-tok', user: { ...MOCK_USER, role: 'employee' }, company: MOCK_COMPANY });
    render(<App />);

    await userEvent.click(screen.getByText('Employee Code'));
    await userEvent.type(screen.getByPlaceholderText('WC-2026-XXXX'), 'WC-TEST-001');
    await userEvent.type(screen.getByPlaceholderText('EMP-001'), 'EMP-101');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'emp-pass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('employee-login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            companyId: 'WC-TEST-001',
            employeeCode: 'EMP-101',
            password: 'emp-pass',
          }),
        })
      );
    });
  });
});

describe('Auth Flow — Dev Quick Login', () => {
  it('logs in instantly without API call and shows sidebar', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /dev.*quick login/i }));

    await waitFor(() => {
      expect(document.querySelector('.brand-name')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('Auth Flow — Logout', () => {
  it('returns to Login screen and clears localStorage after logout', async () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
    localStorage.setItem('company', JSON.stringify(MOCK_COMPANY));

    render(<App />);
    expect(document.querySelector('.brand-name')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Dana Whitfield'));
    await userEvent.click(screen.getByText('Sign out'));

    await waitFor(() => {
      expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
    });
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});

describe('Auth Flow — Register', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('shows Register form when "Create a new workspace" is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /create a new workspace/i }));
    await waitFor(() => {
      expect(screen.getByText('Create your workspace')).toBeInTheDocument();
    });
  });

  it('shows Login form when "Sign in" link is clicked from Register', async () => {
    window.location.hash = '#register';
    render(<App />);
    await userEvent.click(screen.getByText('Sign in'));
    await waitFor(() => {
      expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
    });
  });
});
