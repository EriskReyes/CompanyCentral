import React, { useState } from 'react';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const { token, user, company } = await response.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('company', JSON.stringify(company));

      onLogin({ token, user, company });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Panel - Real Office Photo */}
      <div style={{
        flex: '0 0 50%',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <img
          src="https://static.wixstatic.com/media/fe8534_730700b2a18947aa9b38cc02530088a0~mv2.jpg"
          alt="Office workspace"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 50px',
        background: '#fafbfc',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px)',
        overflow: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo and Branding */}
          <div style={{ marginBottom: '48px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#047857',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '24px',
                color: '#ffffff',
                letterSpacing: '-2px'
              }}>
                W
              </div>
              <h1 style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0',
                letterSpacing: '-0.5px'
              }}>
                WorkCentral
              </h1>
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 12px 0',
              lineHeight: '1.2'
            }}>
              Sign in to your workspace
            </h2>

            {/* Subheading */}
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Access your projects, tasks, and team collaboration tools.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 14px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#991b1b'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a'
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a'
                }}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                marginTop: '8px',
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                transition: 'none'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            margin: '28px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{
              fontSize: '13px',
              color: '#94a3b8',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              New here?
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={() => window.location.hash = '#register'}
            style={{
              width: '100%',
              padding: '11px 16px',
              background: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'none'
            }}
          >
            Create a new workspace
          </button>

          {/* Footer */}
          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            textAlign: 'center',
            margin: '32px 0 0 0',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            By signing in, you agree to our{' '}
            <span style={{ color: '#0f172a', textDecoration: 'underline', cursor: 'pointer' }}>
              Terms of Service
            </span>
            {' '}and{' '}
            <span style={{ color: '#0f172a', textDecoration: 'underline', cursor: 'pointer' }}>
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register({ onRegister }) {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState({ name: '', industry: '' });
  const [admin, setAdmin] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
    'Education', 'Real Estate', 'Hospitality', 'Transportation', 'Energy'
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!company.name || !company.industry) {
        setError('Please fill in all fields');
        return;
      }
      setStep(2);
      return;
    }

    if (admin.password !== admin.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (admin.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, admin }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { token, user, companyData } = await response.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('company', JSON.stringify(companyData));

      onRegister({ token, user, company: companyData });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Panel - Real Office Photo */}
      <div style={{
        flex: '0 0 50%',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <img
          src="https://static.wixstatic.com/media/fe8534_730700b2a18947aa9b38cc02530088a0~mv2.jpg"
          alt="Office workspace"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* Right Panel - Register Form */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 50px',
        background: '#fafbfc',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px)',
        overflow: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo and Branding */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#047857',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '24px',
                color: '#ffffff',
                letterSpacing: '-2px'
              }}>
                W
              </div>
              <h1 style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0',
                letterSpacing: '-0.5px'
              }}>
                WorkCentral
              </h1>
            </div>

            {/* Progress Indicator */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: step >= 1 ? '#047857' : '#e2e8f0',
                  borderRadius: '2px',
                  transition: 'none'
                }} />
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: step >= 2 ? '#047857' : '#e2e8f0',
                  borderRadius: '2px',
                  transition: 'none'
                }} />
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: '0',
                fontWeight: '500'
              }}>
                Step {step} of 2
              </p>
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0',
              lineHeight: '1.3'
            }}>
              {step === 1 ? 'Create your workspace' : 'Set up admin account'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              {step === 1 ? 'Tell us about your company' : 'Create your administrator account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 14px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#991b1b'
            }}>
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {step === 1 ? (
              <>
                {/* Company Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Company name
                  </label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    placeholder="Acme Inc."
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Industry Select */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Industry
                  </label>
                  <select
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  >
                    <option value="">Select an industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Full Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={admin.name}
                    onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                    placeholder="Jane Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                    placeholder="you@company.com"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={admin.password}
                    onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={admin.confirmPassword}
                    onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px'
            }}>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'none'
                  }}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  transition: 'none'
                }}
              >
                {loading ? 'Creating...' : step === 1 ? 'Next' : 'Create workspace'}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center',
            margin: '24px 0 0 0'
          }}>
            Already have an account?{' '}
            <span
              onClick={() => window.location.hash = '#login'}
              style={{
                color: '#047857',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
