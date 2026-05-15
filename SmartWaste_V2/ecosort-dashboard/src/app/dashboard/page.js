'use client';
 
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
 
const CATEGORY_CONFIG = {
  Recyclable: { icon: '🥤', color: '#0ea5e9', bg: '#e0f2fe', label: 'Recyclable Bin' },
  Organic:    { icon: '🍎', color: '#22c55e', bg: '#dcfce7', label: 'Organic Bin' },
  Hazardous:  { icon: '🔋', color: '#f97316', bg: '#ffedd5', label: 'Hazardous Bin' },
  'E-waste':  { icon: '💻', color: '#a855f7', bg: '#f3e8ff', label: 'E-Waste Bin' },
  Unknown:    { icon: '❓', color: '#94a3b8', bg: '#f1f5f9', label: 'Unknown' },
};
 
function getTier(points) {
  if (points >= 5000) return { name: 'Planet Guardian', icon: '🌍', next: null, progress: 100 };
  if (points >= 2000) return { name: 'Eco Champion',   icon: '🏆', next: 5000, progress: ((points - 2000) / 3000) * 100 };
  if (points >= 1000) return { name: 'Eco Warrior',    icon: '🌿', next: 2000, progress: ((points - 1000) / 1000) * 100 };
  if (points >= 400)  return { name: 'Green Scout',    icon: '🌱', next: 1000, progress: ((points - 400) / 600) * 100 };
  return                     { name: 'Newcomer',       icon: '🌾', next: 400,  progress: (points / 400) * 100 };
}
 
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '28px', fontWeight: 800, color: accent || '#0f172a', lineHeight: 1.2 }}>{value}</span>
      {sub && <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{sub}</span>}
    </div>
  );
}
 
export default function DashboardPage() {
  const router = useRouter();
  const webcamRef = useRef(null);
 
  const [user, setUser]                 = useState(null);
  const [classifying, setClassifying]   = useState(false);
  const [lastResult, setLastResult]     = useState(null);
  const [errorMsg, setErrorMsg]         = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [activeTab, setActiveTab]       = useState('overview');
 
  useEffect(() => {
    const storedUser = localStorage.getItem('ecoSortUser');
    const token      = localStorage.getItem('ecoSortToken');
    if (!storedUser || !token) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);
 
  const captureAndClassify = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
 
    setClassifying(true);
    setLastResult(null);
    setErrorMsg('');
 
    try {
      const mlResponse = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });
      const mlData = await mlResponse.json();
 
      if (!mlResponse.ok) {
        setErrorMsg(mlData.error || 'Failed to detect waste.');
        setClassifying(false);
        return;
      }
 
      const token = localStorage.getItem('ecoSortToken');
      // BUG FIX: Added error handling for malformed/missing JWT before decoding
      if (!token) { setErrorMsg('Session expired. Please log in again.'); setClassifying(false); return; }
      let tokenPayload;
      try {
        tokenPayload = JSON.parse(atob(token.split('.')[1]));
      } catch {
        setErrorMsg('Invalid session. Please log in again.');
        setClassifying(false);
        return;
      }
 
      const dbResponse = await fetch('/api/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:      tokenPayload.userId,
          itemDetected: mlData.item,
          category:    mlData.category,
          points:      mlData.points,
        }),
      });
      const dbData = await dbResponse.json();
 
      if (dbResponse.ok) {
        setLastResult(mlData);
        const updatedUser = { ...user, points: dbData.totalPoints, history: dbData.history };
        setUser(updatedUser);
        localStorage.setItem('ecoSortUser', JSON.stringify(updatedUser));
      } else {
        // BUG FIX: surface DB errors to the user instead of silently failing
        setErrorMsg(dbData.error || 'Could not save scan. Please try again.');
      }
    } catch {
      setErrorMsg('Connection error. Make sure the ML backend is running on port 5000.');
    } finally {
      setClassifying(false);
    }
  }, [user]);
 
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
 
  const tier     = getTier(user.points);
  const cafValue = (user.points / 10).toFixed(0);
  const totalItems = user.history ? user.history.length : 0;
  const recyclableCount = user.history ? user.history.filter(h => h.category === 'Recyclable').length : 0;
 
  const navItems = [
    { id: 'overview', label: 'Overview',    emoji: '📊' },
    { id: 'scanner',  label: 'AI Scanner',  emoji: '📷' },
    { id: 'history',  label: 'History',     emoji: '📋' },
  ];
 
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0fdf4', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
 
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, marginBottom: 40 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #16a34a, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>♻️</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>EcoSort</span>
        </div>
 
        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === item.id ? 700 : 500,
                background: activeTab === item.id ? '#f0fdf4' : 'transparent',
                color:      activeTab === item.id ? '#16a34a' : '#64748b',
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              {item.label}
              {activeTab === item.id && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              )}
            </button>
          ))}
        </nav>
 
        {/* User + Logout */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80, #2dd4bf)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 14,
            }}>{user.name.charAt(0)}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name.split(' ')[0]}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{user.lpuUid}</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
 
      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 40px' }}>
 
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                Good day, {user.name.split(' ')[0]} 👋
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontWeight: 500 }}>Here's your sustainability snapshot.</p>
            </div>
 
            {/* Points Hero */}
            <div style={{
              background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #0f766e 100%)',
              borderRadius: 24, padding: '36px 40px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 20px 60px rgba(22, 101, 52, 0.3)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -60, top: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', right: 40, bottom: -80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Reward Points</p>
                <p style={{ margin: 0, fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>
                  {user.points.toLocaleString()}
                  <span style={{ fontSize: 24, fontWeight: 600, color: '#86efac', marginLeft: 8 }}>pts</span>
                </p>
                <p style={{ margin: '12px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  ≈ ₹{cafValue} value in campus cafeteria
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
                  marginBottom: 8,
                }}>🏅</div>
                <button style={{
                  padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: '#4ade80', color: '#14532d', fontWeight: 800, fontSize: 13,
                }}>Redeem</button>
              </div>
            </div>
 
            {/* Stat Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <StatCard label="Tier Status" value={`${tier.icon} ${tier.name}`} sub={tier.next ? `${tier.next - user.points} pts to next tier` : 'Max tier reached!'} />
              <StatCard label="Items Scanned" value={totalItems} sub="Total disposals" accent="#0f172a" />
              <StatCard label="Recyclable Items" value={recyclableCount} sub={`${totalItems ? Math.round((recyclableCount / totalItems) * 100) : 0}% of total`} accent="#16a34a" />
            </div>
 
            {/* Tier Progress */}
            {tier.next && (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Tier Progress</p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{tier.name} → Next tier at {tier.next.toLocaleString()} pts</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{Math.round(tier.progress)}%</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 100, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${tier.progress}%`, height: '100%', borderRadius: 100,
                    background: 'linear-gradient(90deg, #4ade80, #16a34a)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )}
 
            {/* Recent History Preview */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>📋 Recent Disposal History</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >View all →</button>
              </div>
              {user.history && user.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...user.history].slice(0, 5).map((record, i) => {
                    const cfg = CATEGORY_CONFIG[record.category] || CATEGORY_CONFIG.Unknown;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px', borderRadius: 14,
                        background: '#f8fafc', border: '1px solid #f1f5f9',
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12, fontSize: 22,
                          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{cfg.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a', textTransform: 'capitalize' }}>{record.itemDetected}</p>
                          <p style={{ margin: '1px 0 0', fontSize: 12, color: '#94a3b8' }}>{cfg.label}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: record.pointsEarned > 0 ? '#16a34a' : '#94a3b8' }}>
                            {record.pointsEarned > 0 ? `+${record.pointsEarned}` : '0'} pts
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#cbd5e1' }}>
                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🍃</p>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>No scans yet. Start sorting!</p>
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* ── SCANNER TAB ── */}
        {activeTab === 'scanner' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>AI Waste Scanner 📷</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontWeight: 500 }}>Point the camera at a waste item to classify and earn points.</p>
            </div>
 
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Camera Feed</h3>
                <button
                  onClick={() => { setCameraActive(!cameraActive); setLastResult(null); setErrorMsg(''); }}
                  style={{
                    padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 13,
                    background: cameraActive ? '#fef2f2' : '#0f172a',
                    color:      cameraActive ? '#ef4444' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  {cameraActive ? '✕ Close Camera' : '📷 Open Camera'}
                </button>
              </div>
 
              {cameraActive ? (
                <div style={{ borderRadius: 16, overflow: 'hidden', background: '#0f172a', position: 'relative', aspectRatio: '16/9', marginBottom: 16 }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Scan overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 180, height: 180, border: '2px solid rgba(74, 222, 128, 0.7)', borderRadius: 20,
                      boxShadow: '0 0 0 2000px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                  {classifying && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 12,
                    }}>
                      <div style={{ width: 36, height: 36, border: '3px solid #4ade80', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <p style={{ margin: 0, fontWeight: 700, letterSpacing: '0.1em', fontSize: 14 }}>ANALYZING…</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  borderRadius: 16, background: '#f8fafc', border: '2px dashed #e2e8f0',
                  aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, color: '#94a3b8',
                }}>
                  <span style={{ fontSize: 40, marginBottom: 10 }}>📷</span>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Camera inactive</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13 }}>Click "Open Camera" to start scanning</p>
                </div>
              )}
 
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
                  ⚠️ {errorMsg}
                </div>
              )}
 
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={captureAndClassify}
                  disabled={!cameraActive || classifying}
                  style={{
                    padding: '12px 28px', borderRadius: 12, border: 'none', cursor: cameraActive && !classifying ? 'pointer' : 'not-allowed',
                    background: cameraActive && !classifying ? 'linear-gradient(135deg, #16a34a, #0d9488)' : '#e2e8f0',
                    color: cameraActive && !classifying ? '#fff' : '#94a3b8',
                    fontWeight: 800, fontSize: 14, transition: 'all 0.15s',
                    boxShadow: cameraActive && !classifying ? '0 4px 20px rgba(22, 163, 74, 0.35)' : 'none',
                  }}
                >
                  {classifying ? 'Scanning…' : '⚡ Scan Waste Item'}
                </button>
 
                {lastResult && (
                  <div style={{
                    flex: 1, minWidth: 200, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: '#86efac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 15, color: '#14532d', textTransform: 'capitalize' }}>{lastResult.item}</p>
                      <p style={{ margin: '1px 0 0', fontSize: 12, color: '#22c55e' }}>
                        {(CATEGORY_CONFIG[lastResult.category] || CATEGORY_CONFIG.Unknown).label}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 20, fontWeight: 900, color: '#16a34a',
                      background: '#dcfce7', padding: '6px 14px', borderRadius: 10,
                    }}>+{lastResult.points}</span>
                  </div>
                )}
              </div>
            </div>
 
            {/* Bin Guide */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>🗑️ Bin Guide</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== 'Unknown').map(([cat, cfg]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: cfg.bg, borderRadius: 12 }}>
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Disposal History 📋</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontWeight: 500 }}>All your scanned waste items — up to the last 20.</p>
            </div>
 
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28 }}>
              {user.history && user.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...user.history].map((record, i) => {
                    const cfg = CATEGORY_CONFIG[record.category] || CATEGORY_CONFIG.Unknown;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 18px', borderRadius: 16,
                        background: i % 2 === 0 ? '#f8fafc' : '#fff',
                        border: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                      }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 14, fontSize: 24,
                          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{cfg.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', textTransform: 'capitalize' }}>{record.itemDetected}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: record.pointsEarned > 0 ? '#16a34a' : '#94a3b8' }}>
                            {record.pointsEarned > 0 ? `+${record.pointsEarned}` : '0'} pts
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#cbd5e1' }}>
                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' · '}
                            {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>🍃</p>
                  <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#64748b' }}>No disposal history yet</p>
                  <p style={{ margin: '6px 0 0', fontSize: 14 }}>Use the AI Scanner to start logging items!</p>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    style={{
                      marginTop: 20, padding: '10px 24px', borderRadius: 10, border: 'none',
                      background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    }}
                  >Go to Scanner →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
 
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}