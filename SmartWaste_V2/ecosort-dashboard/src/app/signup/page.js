'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', lpuUid: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Success! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else setMessage(data.message || 'Something went wrong.');
    } catch (error) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg mb-6 mx-auto transform -rotate-6">🌱</div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center tracking-tight">Join EcoSort</h1>
        <p className="text-slate-500 font-medium text-center mb-8">Create your Circular Economy Profile</p>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-center font-bold text-sm border ${message.includes('Success') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
            <input type="text" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">University Email</label>
            <input type="email" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">LPU UID</label>
            <input type="text" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, lpuUid: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input type="password" required className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold text-slate-800" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold p-4 rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/20 mt-6 active:scale-95 disabled:opacity-50">
            {loading ? 'Creating Profile...' : 'Register Profile'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-slate-500">
          Already have an account? <Link href="/login" className="text-emerald-600 hover:text-emerald-500 underline decoration-2 underline-offset-2">Login here</Link>
        </p>
      </div>
    </div>
  );
}