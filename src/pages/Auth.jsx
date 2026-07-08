import React, { useState } from 'react';

export function Login({ onLogin }) {
  const [mode, setMode] = useState('email'); // 'email' | 'employee'

  // Email login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Employee login fields
  const [companyId, setCompanyId]       = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [empPassword, setEmpPassword]   = useState('');

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let url, body;
      if (mode === 'email') {
        url  = '/api/auth/login';
        body = JSON.stringify({ email, password });
      } else {
        url  = '/api/auth/employee-login';
        body = JSON.stringify({ companyId, employeeCode, password: empPassword });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      const { token, user, company } = data;
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Panel - Real Office Photo */}
      <div style={{
        flex: '0 0 50%',
        background: 'var(--surface-2)',
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
        background: 'var(--bg)',
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
                background: 'var(--accent)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: "28px",
                color: 'var(--surface)',
                letterSpacing: '-2px'
              }}>
                W
              </div>
              <h1 style={{
                fontSize: "30px",
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0',
                letterSpacing: '-0.5px'
              }}>
                WorkCentral
              </h1>
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: "36px",
              fontWeight: '700',
              color: 'var(--ink)',
              margin: '0 0 12px 0',
              lineHeight: '1.2'
            }}>
              Sign in to your workspace
            </h2>

            {/* Subheading */}
            <p style={{
              fontSize: "19px",
              color: 'var(--ink-3)',
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
              background: 'var(--red-soft)',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: "17px",
              color: 'var(--red)'
            }}>
              {error}
            </div>
          )}

          {/* Mode tabs */}
          <div style={{ display: 'flex', marginBottom: '28px', background: 'var(--surface-2)', borderRadius: '8px', padding: '4px', border: '1px solid var(--line)' }}>
            {[['email','Admin / Email'],['employee','Employee Code']].map(([m, label]) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'none',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--ink-3)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {mode === 'email' ? (
              <>
                <div>
                  <label style={{ display:'block', fontSize:'17px', fontWeight:'600', color:'var(--ink)', marginBottom:'8px' }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                    style={{ width:'100%', padding:'11px 13px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'18px', fontFamily:'inherit', background:'var(--surface)', outline:'none', boxSizing:'border-box', color:'var(--ink)' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'17px', fontWeight:'600', color:'var(--ink)', marginBottom:'8px' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
                    style={{ width:'100%', padding:'11px 13px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'18px', fontFamily:'inherit', background:'var(--surface)', outline:'none', boxSizing:'border-box', color:'var(--ink)' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ padding:'12px 14px', background:'var(--accent-soft)', borderRadius:'8px', fontSize:'14px', color:'var(--accent-ink)', lineHeight:1.5 }}>
                  Ask your administrator for your <strong>Company ID</strong>, <strong>Employee Code</strong> and <strong>temporary password</strong>.
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'17px', fontWeight:'600', color:'var(--ink)', marginBottom:'8px' }}>Company ID</label>
                  <input value={companyId} onChange={e => setCompanyId(e.target.value)} placeholder="WC-2026-XXXX" required
                    style={{ width:'100%', padding:'11px 13px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'18px', fontFamily:'monospace', background:'var(--surface)', outline:'none', boxSizing:'border-box', color:'var(--ink)', letterSpacing:'0.05em' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'17px', fontWeight:'600', color:'var(--ink)', marginBottom:'8px' }}>Employee Code</label>
                  <input value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} placeholder="EMP-001" required
                    style={{ width:'100%', padding:'11px 13px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'18px', fontFamily:'monospace', background:'var(--surface)', outline:'none', boxSizing:'border-box', color:'var(--ink)', letterSpacing:'0.05em' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'17px', fontWeight:'600', color:'var(--ink)', marginBottom:'8px' }}>Password</label>
                  <input type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} placeholder="Enter your password" required
                    style={{ width:'100%', padding:'11px 13px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'18px', fontFamily:'inherit', background:'var(--surface)', outline:'none', boxSizing:'border-box', color:'var(--ink)' }} />
                </div>
              </>
            )}

            {/* Sign In Button */}
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'11px 16px', marginTop:'8px', background:'var(--accent)', color:'var(--surface)', border:'none', borderRadius:'6px', fontSize:'18px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition:'none' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Dev Quick Login Button */}
            <button type="button"
              onClick={() => {
                const mockUser    = { id:'E-101', name:'Dana Whitfield', firstName:'Dana', lastName:'Whitfield', email:'dana@workcentral.io', role:'admin' };
                const mockCompany = { companyId:'WC-DEV-TEST', name:'Development Inc.' };
                localStorage.setItem('authToken', 'dev-mock-token');
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('company', JSON.stringify(mockCompany));
                onLogin({ token:'dev-mock-token', user:mockUser, company:mockCompany });
              }}
              style={{ width:'100%', padding:'11px 16px', background:'var(--surface-2)', color:'var(--ink)', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'16px', fontWeight:'600', cursor:'pointer', transition:'none' }}>
              🛠 Dev: Quick Login (Admin)
            </button>
          </form>

          {/* Divider */}
          <div style={{
            margin: '28px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            <span style={{
              fontSize: "17px",
              color: 'var(--muted)',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              New here?
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={() => window.location.hash = '#register'}
            style={{
              width: '100%',
              padding: '11px 16px',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: "18px",
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'none'
            }}
          >
            Create a new workspace
          </button>

          {/* Footer */}
          <p style={{
            fontSize: "15px",
            color: 'var(--muted)',
            textAlign: 'center',
            margin: '32px 0 0 0',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            By signing in, you agree to our{' '}
            <span style={{ color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }}>
              Terms of Service
            </span>
            {' '}and{' '}
            <span style={{ color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }}>
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Panel - Real Office Photo */}
      <div style={{
        flex: '0 0 50%',
        background: 'var(--surface-2)',
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
        background: 'var(--bg)',
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
                background: 'var(--accent)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: "28px",
                color: 'var(--surface)',
                letterSpacing: '-2px'
              }}>
                W
              </div>
              <h1 style={{
                fontSize: "30px",
                fontWeight: '700',
                color: 'var(--ink)',
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
                  background: step >= 1 ? 'var(--accent)' : 'var(--line)',
                  borderRadius: '2px',
                  transition: 'none'
                }} />
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: step >= 2 ? 'var(--accent)' : 'var(--line)',
                  borderRadius: '2px',
                  transition: 'none'
                }} />
              </div>
              <p style={{
                fontSize: "16px",
                color: 'var(--ink-3)',
                margin: '0',
                fontWeight: '500'
              }}>
                Step {step} of 2
              </p>
            </div>

            <h2 style={{
              fontSize: "32px",
              fontWeight: '700',
              color: 'var(--ink)',
              margin: '0 0 8px 0',
              lineHeight: '1.3'
            }}>
              {step === 1 ? 'Create your workspace' : 'Set up admin account'}
            </h2>
            <p style={{
              fontSize: "18px",
              color: 'var(--ink-3)',
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
              background: 'var(--red-soft)',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: "17px",
              color: 'var(--red)'
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
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
                    }}
                  />
                </div>

                {/* Industry Select */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
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
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
                    }}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: "17px",
                    fontWeight: '600',
                    color: 'var(--ink)',
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
                      fontSize: "18px",
                      fontFamily: 'inherit',
                      background: 'var(--surface)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--ink)'
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
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: "18px",
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
                  background: 'var(--accent)',
                  color: 'var(--surface)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: "18px",
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
            fontSize: "17px",
            color: 'var(--ink-3)',
            textAlign: 'center',
            margin: '24px 0 0 0'
          }}>
            Already have an account?{' '}
            <span
              onClick={() => window.location.hash = '#login'}
              style={{
                color: 'var(--accent)',
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
