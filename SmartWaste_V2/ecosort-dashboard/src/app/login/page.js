'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.15s, background 0.15s',
  fontFamily: 'inherit',
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ecoSortToken', data.token);
        localStorage.setItem('ecoSortUser', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setMessage(data.message || 'Invalid credentials.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: '#020b06',
    }}>
      {/* ── Left Panel ── */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #052e16 0%, #0f172a 100%)',
      }}
        className="left-panel"
      >
        {/* Glow */}
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♻️</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>EcoSort</span>
        </div>

        {/* Center quote */}
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 20 }}>
            Every scan<br />
            <span style={{ background: 'linear-gradient(90deg,#4ade80,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              makes a difference.
            </span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.6, maxWidth: 340 }}>
            Join the circular economy movement at LPU. Classify waste, earn rewards, and help build a greener campus.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
          {[['3,200+', 'Active Users'], ['94%', 'Sort Accuracy'], ['₹48K+', 'Rewards Issued']].map(([v, l]) => (
            <div key={l}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#4ade80' }}>{v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div style={{
        width: '100%', maxWidth: 520, margin: '0 auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♻️</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>EcoSort</span>
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Welcome back</h1>
        <p style={{ margin: '0 0 36px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Log in to your EcoSort profile</p>

        {message && (
          <div style={{
            marginBottom: 24, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ⚠️ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
              LPU UID or Email
            </label>
            <input
              type="text"
              required
              placeholder="12000000 or email@lpu.in"
              style={{
                ...inputStyle,
                borderColor: focused === 'id' ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
                background: focused === 'id' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
              }}
              onFocus={() => setFocused('id')}
              onBlur={() => setFocused('')}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={{
                ...inputStyle,
                borderColor: focused === 'pw' ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
                background: focused === 'pw' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
              }}
              onFocus={() => setFocused('pw')}
              onBlur={() => setFocused('')}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #16a34a, #0d9488)',
              color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 4px 24px rgba(22,163,74,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Logging in…
              </>
            ) : 'Log In →'}
          </button>
        </form>

        <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>

        <p style={{ marginTop: 'auto', paddingTop: 48, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>
          LPU Circular Economy Initiative © 2025
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @media (min-width: 768px) { .left-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}