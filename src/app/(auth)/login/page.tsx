'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import ToastContainer from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Proactively run setup-admin on load to make sure an admin user exists
  useEffect(() => {
    fetch('/api/setup-admin')
      .then((res) => res.json())
      .then((data) => {
        console.log('Admin setup response:', data);
      })
      .catch((err) => {
        console.error('Failed to trigger admin setup:', err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing credentials', 'Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Access Granted', `Welcome back, ${data.user.name}!`);
        // Seed database if it's empty so the user sees some nice data on first load
        fetch('/api/seed-demo').catch(() => {});
        
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        toast.error('Access Denied', data.error || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Authentication Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">NexGenAiTech</h1>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-1">Sales Operating System</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-2xl border border-zinc-900 shadow-2xl relative">
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome Back</h2>
            <p className="text-xs text-zinc-400 mt-1">Sign in with your administrator credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="admin@nexgenaitech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                <span className="text-[10px] text-zinc-500 hover:text-zinc-400 cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white rounded-xl py-2.5 px-4 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 hover:shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Start Tip */}
          <div className="mt-6 p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl flex items-start gap-2.5">
            <Shield size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="text-[10px] text-zinc-400 leading-normal">
              <span className="font-bold text-white">Quick Start Tip:</span> We automatically set up a default admin for you. Use <code className="text-blue-400 bg-blue-950/60 px-1 py-0.5 rounded">admin@nexgenaitech.com</code> and password <code className="text-blue-400 bg-blue-950/60 px-1 py-0.5 rounded">admin123</code>.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-zinc-600 text-center mt-8 tracking-wider">
          SECURE CONNECT • TLS 1.3 ENCRYPTED
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}
