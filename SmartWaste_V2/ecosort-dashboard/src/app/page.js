import Link from 'next/link';

export default function HomePage() {
  const features = [
    { icon: '🤖', title: 'AI Classification', desc: 'Snap a photo — our model identifies the waste type and the correct bin instantly.' },
    { icon: '🏆', title: 'Earn Reward Points', desc: 'Every correct disposal earns points redeemable at the campus cafeteria.' },
    { icon: '📊', title: 'Track Your Impact', desc: 'Watch your sustainability score grow and climb the campus leaderboard.' },
    { icon: '♻️', title: 'Circular Economy', desc: 'Your actions directly reduce campus waste and support sustainability goals.' },
  ];

  const stats = [
    { value: '12,400+', label: 'Items Classified' },
    { value: '₹48,000', label: 'Rewards Issued' },
    { value: '94%', label: 'Sort Accuracy' },
    { value: '3,200+', label: 'Students Active' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020b06', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: '#fff', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 68,
        background: 'rgba(2, 11, 6, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #16a34a, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>♻️</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.4px' }}>EcoSort</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{
            padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            transition: 'all 0.15s',
          }}>Log In</Link>
          <Link href="/signup" style={{
            padding: '8px 20px', borderRadius: 10,
            background: '#16a34a', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px' }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)',
            marginBottom: 32,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', letterSpacing: '0.08em', textTransform: 'uppercase' }}>EcoSort Campus System — Live</span>
          </div>

          <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px' }}>
            Sort Smarter.<br />
            <span style={{ background: 'linear-gradient(90deg, #4ade80, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Earn Bigger.
            </span>
          </h1>

          <p style={{ margin: '0 auto 48px', maxWidth: 560, fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 400 }}>
            AI-powered waste classification at LPU. Scan any item, get instant bin guidance, and earn real rewards for every correct disposal.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '15px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #0d9488)',
              color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 0 40px rgba(22,163,74,0.35)',
              transition: 'transform 0.15s',
            }}>
              Start Earning Points →
            </Link>
            <Link href="/login" style={{
              padding: '15px 36px', borderRadius: 14,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 15, textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 48px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '12px 0',
            borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <p style={{ margin: 0, fontSize: 34, fontWeight: 900, color: '#4ade80', letterSpacing: '-1px' }}>{s.value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>How It Works</p>
          <h2 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: '-1px' }}>Everything you need to sort right</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '32px', borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, fontSize: 26,
                background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: '#fff' }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          borderRadius: 24, padding: '60px 64px',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(13,148,136,0.1))',
          border: '1px solid rgba(22,163,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>Ready to make an impact?</h2>
            <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Join 3,200+ LPU students already earning rewards for sustainable habits.</p>
          </div>
          <Link href="/signup" style={{
            padding: '14px 32px', borderRadius: 12, flexShrink: 0,
            background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>Create Free Account →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>♻️</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>EcoSort — LPU Circular Economy Initiative</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2025 EcoSort. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}