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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', lpuUid: '', password: '' });
  const [message, setMessage]   = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setMessage('Profile created! Redirecting to login…');
        setTimeout(() => router.push('/login'), 2200);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setIsSuccess(false);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    style: {
      ...inputStyle,
      borderColor: focused === key ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
      background:  focused === key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
    },
    onFocus: () => setFocused(key),
    onBlur:  () => setFocused(''),
  });

  const steps = ['Create account', 'Sort waste', 'Earn rewards'];

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
        <div style={{ position: 'absolute', top: '25%', left: '15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♻️</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>EcoSort</span>
        </div>

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 20 }}>
            Three steps to<br />
            <span style={{ background: 'linear-gradient(90deg,#4ade80,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              a greener campus.
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#4ade80',
                }}>{i + 1}</div>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
          {[['Free', 'No cost ever'], ['Instant', 'Points credited live'], ['Secure', 'Data encrypted']].map(([v, l]) => (
            <div key={l}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#4ade80' }}>{v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div style={{
        width: '100%', maxWidth: 540, margin: '0 auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♻️</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>EcoSort</span>
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Create your profile</h1>
        <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Join the LPU circular economy movement — it's free.</p>

        {message && (
          <div style={{
            marginBottom: 24, padding: '12px 16px', borderRadius: 12,
            background: isSuccess ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isSuccess ? 'rgba(22,163,74,0.3)' : 'rgba(239,68,68,0.25)'}`,
            color: isSuccess ? '#86efac' : '#fca5a5',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {isSuccess ? '✅' : '⚠️'} {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>Full Name</label>
              <input
                type="text" required placeholder="Chetan Mungalpara"
                {...field('name')}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>LPU UID</label>
              <input
                type="text" required placeholder="12207641"
                {...field('uid')}
                onChange={(e) => setFormData({ ...formData, lpuUid: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>University Email</label>
            <input
              type="email" required placeholder="name@lpu.in"
              {...field('email')}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>Password</label>
            <input
              type="password" required placeholder="Min. 8 characters"
              {...field('pw')}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isSuccess}
            style={{
              marginTop: 8, padding: '14px', borderRadius: 12, border: 'none',
              cursor: (loading || isSuccess) ? 'not-allowed' : 'pointer',
              background: (loading || isSuccess) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #0d9488)',
              color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: (loading || isSuccess) ? 'none' : '0 4px 24px rgba(22,163,74,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Creating profile…
              </>
            ) : isSuccess ? '✅ Profile Created!' : 'Create Profile →'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
            Log in
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