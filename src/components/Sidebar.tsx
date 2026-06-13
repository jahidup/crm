'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Target, 
  Bot, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Follow Ups', path: '/followups', icon: Calendar },
    { name: 'Opportunities', path: '/opportunities', icon: Target },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Failed to log out');
      }
    } catch (e) {
      toast.error('Logout error');
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-[280px] bg-zinc-950 border-r border-zinc-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-500">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider leading-none">NexGenAiTech</h1>
              <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">Sales OS</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-500' : 'text-zinc-400'} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button & Current User Card */}
        <div className="p-4 border-t border-zinc-900 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-900">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
            <span className="text-[8px] font-extrabold bg-blue-950/40 text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded uppercase">
              {user.role}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
