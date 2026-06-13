import React from 'react';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';
import { Shield, Mail, Key } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let user = { name: 'NexGen Admin', email: 'admin@nexgenaitech.com', role: 'admin' };
  if (token) {
    const payload = await verifyJWT(token, JWT_SECRET);
    if (payload) {
      user = {
        name: payload.name || 'NexGen Admin',
        email: payload.email || 'admin@nexgenaitech.com',
        role: payload.role || 'admin',
      };
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Admin Profile</h2>
        <p className="text-xs text-zinc-500">View your active administrator account credentials and access permissions.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-extrabold text-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] shrink-0">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="space-y-4 flex-1 text-xs">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Administrator Name</span>
            <span className="text-sm font-bold text-white mt-1 block">{user.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Login Email</span>
              <span className="text-xs font-mono text-zinc-300 mt-1 block">{user.email}</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Authorization Level</span>
              <span className="text-xs font-bold text-blue-400 mt-1 block uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
