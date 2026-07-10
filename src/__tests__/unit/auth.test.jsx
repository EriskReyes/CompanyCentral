import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login, Register } from '../../pages/Auth';

const mockOnLogin = vi.fn();
const mockOnRegister = vi.fn();

function mockFetchSuccess(data) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchError(message = 'Login failed') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: message }),
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────
describe('Login', () => {
  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  it('renders sign-in heading', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
  });

  it('renders email and employee tab switcher', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText('Admin / Email')).toBeInTheDocument();
    expect(screen.getByText('Employee Code')).toBeInTheDocument();
  });

  it('shows email and password fields by default', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('switches to employee mode and shows Company ID field', async () => {
    render(<Login onLogin={mockOnLogin} />);
    await userEvent.click(screen.getByText('Employee Code'));
    expect(screen.getByPlaceholderText('WC-2026-XXXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('EMP-001')).toBeInTheDocument();
  });

  it('calls onLogin with token/user/company on successful email login', async () => {
    const mockData = {
      token: 'test-token',
      user: { id: 'E-101', name: 'Dana Whitfield', role: 'admin' },
      company: { companyId: 'WC-001', name: 'Test Corp' },
    };
    mockFetchSuccess(mockData);

    render(<Login onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockData);
    });
  });

  it('shows error message on failed login', async () => {
    mockFetchError('Invalid credentials');
    render(<Login onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'bad@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows loading state while submitting', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(<Login onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('calls employee-login endpoint when in employee mode', async () => {
    const mockData = {
      token: 'emp-token',
      user: { id: 'E-103', name: 'Priya Raman', role: 'employee' },
      company: { companyId: 'WC-001', name: 'Test Corp' },
    };
    mockFetchSuccess(mockData);

    render(<Login onLogin={mockOnLogin} />);
    await userEvent.click(screen.getByText('Employee Code'));
    await userEvent.type(screen.getByPlaceholderText('WC-2026-XXXX'), 'WC-001');
    await userEvent.type(screen.getByPlaceholderText('EMP-001'), 'EMP-103');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('employee-login'),
        expect.any(Object)
      );
    });
  });

  it('dev quick login button calls onLogin without fetch', async () => {
    render(<Login onLogin={mockOnLogin} />);
    await userEvent.click(screen.getByRole('button', { name: /dev.*quick login/i }));
    expect(mockOnLogin).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('dev quick login sets localStorage and calls onLogin', async () => {
    render(<Login onLogin={mockOnLogin} />);
    await userEvent.click(screen.getByRole('button', { name: /dev.*quick login/i }));
    expect(localStorage.getItem('authToken')).toBe('dev-mock-token');
    expect(mockOnLogin).toHaveBeenCalled();
  });

  it('renders "Create a new workspace" link', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByRole('button', { name: /create a new workspace/i })).toBeInTheDocument();
  });
});

// ─── Register ────────────────────────────────────────────────────────────────
describe('Register', () => {
  beforeEach(() => {
    mockOnRegister.mockClear();
  });

  it('renders "Create your workspace" heading on step 1', () => {
    render(<Register onRegister={mockOnRegister} />);
    expect(screen.getByText('Create your workspace')).toBeInTheDocument();
  });

  it('shows company name and industry fields on step 1', () => {
    render(<Register onRegister={mockOnRegister} />);
    expect(screen.getByPlaceholderText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows step indicator "Step 1 of 2"', () => {
    render(<Register onRegister={mockOnRegister} />);
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked with valid data', async () => {
    render(<Register onRegister={mockOnRegister} />);
    await userEvent.type(screen.getByPlaceholderText('Acme Inc.'), 'My Company');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Technology');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    });
    expect(screen.getByText('Set up admin account')).toBeInTheDocument();
  });

  it('shows error when required step 1 fields are missing', async () => {
    render(<Register onRegister={mockOnRegister} />);
    // Use fireEvent.submit to bypass HTML5 constraint validation in jsdom
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  it('Back button returns to step 1 from step 2', async () => {
    render(<Register onRegister={mockOnRegister} />);
    // Advance to step 2
    await userEvent.type(screen.getByPlaceholderText('Acme Inc.'), 'My Company');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Technology');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByText('Step 2 of 2'));

    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<Register onRegister={mockOnRegister} />);
    // Step 1
    await userEvent.type(screen.getByPlaceholderText('Acme Inc.'), 'My Company');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Technology');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByText('Step 2 of 2'));

    // Step 2 — use exact placeholder text for both password fields
    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'jane@co.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: /create workspace/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls onRegister with token/user/company on successful registration', async () => {
    const mockData = {
      token: 'reg-token',
      user: { id: 'E-201', name: 'Jane Doe', role: 'admin' },
      companyData: { companyId: 'WC-NEW', name: 'My Company' },
    };
    mockFetchSuccess(mockData);

    render(<Register onRegister={mockOnRegister} />);
    // Step 1
    await userEvent.type(screen.getByPlaceholderText('Acme Inc.'), 'My Company');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Technology');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByText('Step 2 of 2'));

    // Step 2 — use exact placeholder text for both password fields
    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'jane@co.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'pass1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /create workspace/i }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith({
        token: 'reg-token',
        user: mockData.user,
        company: mockData.companyData,
      });
    });
  });
});
