'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ecoSortToken', data.token);
        localStorage.setItem('ecoSortUser', JSON.stringify(data.user));
        router.push('/dashboard');
      } else setMessage(data.message || 'Invalid credentials.');
    } catch (error) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg mb-6 mx-auto transform rotate-6">♻️</div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center tracking-tight">Welcome Back</h1>
        <p className="text-slate-500 font-medium text-center mb-8">Login to your EcoSort Profile</p>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-center font-bold text-sm bg-red-50 text-red-600 border border-red-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">LPU UID or Email</label>
            <input type="text" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input type="password" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold p-4 rounded-xl hover:bg-slate-800 transition-all shadow-md mt-4 active:scale-95 disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-slate-500">
          New to EcoSort? <Link href="/signup" className="text-emerald-600 hover:text-emerald-500 underline decoration-2 underline-offset-2">Create an account</Link>
        </p>
      </div>
    </div>
  );
}