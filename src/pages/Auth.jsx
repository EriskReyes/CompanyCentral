import React, { useState } from 'react';
import { Icon } from '../icons';
import { Btn, Badge } from '../ui';

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
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-2)' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:40, height:40, background:'var(--accent)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l3.5 11 3-7 2.5 7L18 7" /><path d="M19.5 5.5l1.5 13" opacity="0.5" />
              </svg>
            </div>
            <div style={{ fontSize:22, fontWeight:700 }}>WorkCentral</div>
          </div>
          <div style={{ fontSize:13, color:'var(--muted)' }}>Sign in to your workspace</div>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--line)',
                borderRadius:'var(--r-md)',
                fontSize:13,
                fontFamily:'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--line)',
                borderRadius:'var(--r-md)',
                fontSize:13,
                fontFamily:'inherit',
              }}
            />
          </div>

          {error && (
            <div style={{ padding:'10px 12px', background:'#fee', border:'1px solid #f88', borderRadius:'var(--r-md)', fontSize:12.5, color:'#b22' }}>
              {error}
            </div>
          )}

          <Btn variant="primary" style={{ width:'100%', marginTop:6 }} onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Btn>
        </form>

        <div style={{ marginTop:24, textAlign:'center', fontSize:12.5, color:'var(--muted)' }}>
          Don't have an account? <a href="#register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign up</a>
        </div>
      </div>
    </div>
  );
}

export function Register({ onRegister }) {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = () => {
    if (!company.trim() || !industry) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: { name: company, industry },
          admin: { name, email, password },
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { token, user, company: companyData } = await response.json();
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

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
    'Education', 'Media', 'Energy', 'Transportation', 'Other'
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-2)' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:40, height:40, background:'var(--accent)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l3.5 11 3-7 2.5 7L18 7" /><path d="M19.5 5.5l1.5 13" opacity="0.5" />
              </svg>
            </div>
            <div style={{ fontSize:22, fontWeight:700 }}>WorkCentral</div>
          </div>
          <div style={{ fontSize:13, color:'var(--muted)' }}>Create your workspace</div>
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          <div style={{ flex:1, height:3, background: step >= 1 ? 'var(--accent)' : 'var(--line)', borderRadius:99 }} />
          <div style={{ flex:1, height:3, background: step >= 2 ? 'var(--accent)' : 'var(--line)', borderRadius:99 }} />
        </div>

        {step === 1 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Company name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                  background:'var(--surface)',
                }}
              >
                <option value="">Select an industry</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            {error && (
              <div style={{ padding:'10px 12px', background:'#fee', border:'1px solid #f88', borderRadius:'var(--r-md)', fontSize:12.5, color:'#b22' }}>
                {error}
              </div>
            )}

            <Btn variant="primary" style={{ width:'100%', marginTop:6 }} onClick={handleStep1}>
              Next
            </Btn>
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, marginBottom:6, color:'var(--ink-2)' }}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-md)',
                  fontSize:13,
                  fontFamily:'inherit',
                }}
              />
            </div>

            {error && (
              <div style={{ padding:'10px 12px', background:'#fee', border:'1px solid #f88', borderRadius:'var(--r-md)', fontSize:12.5, color:'#b22' }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="ghost" style={{ flex:1 }} onClick={() => { setStep(1); setError(''); }}>
                Back
              </Btn>
              <Btn variant="primary" style={{ flex:1 }} onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating...' : 'Create workspace'}
              </Btn>
            </div>
          </form>
        )}

        <div style={{ marginTop:24, textAlign:'center', fontSize:12.5, color:'var(--muted)' }}>
          Already have an account? <a href="#login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
