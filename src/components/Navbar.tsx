'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, Moon, Sun, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface NavbarProps {
  onMenuClick: () => void;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Navbar({ onMenuClick, user }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  // Placeholder notifications for visual layout
  const notifications = [
    { id: '1', title: 'New lead assigned', desc: 'Sarah Connor was assigned to you.', time: '2h ago' },
    { id: '2', title: 'Overdue follow-up', desc: 'Call Tony Stark regarding Logistics LLM.', time: '5h ago' },
    { id: '3', title: 'Opportunity status won!', desc: 'Stark Industries contract was finalized.', time: '1d ago' },
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-zinc-950/70 border-b border-zinc-900 backdrop-blur-md">
      {/* Search & Menu Toggles */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar (Triggers Ctrl+K) */}
        <button
          onClick={() => {
            // Dispatch a Ctrl+K keydown event to open CommandPalette
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
            window.dispatchEvent(event);
          }}
          className="hidden md:flex items-center gap-3 w-80 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 text-left text-zinc-500 hover:text-zinc-400 transition-all duration-200"
        >
          <Search size={15} />
          <span className="text-xs">Global Search...</span>
          <kbd className="ml-auto text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-600 px-1.5 py-0.5 rounded font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle (Default Dark Mode) */}
        <button
          onClick={() => toast.info('Premium Dark Mode is set as default.')}
          className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-colors"
          title="Theme Toggle"
        >
          <Moon size={18} className="text-blue-500" />
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 border-2 border-zinc-950 rounded-full animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-blue-500 hover:underline cursor-pointer">Clear All</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-900 hover:bg-zinc-900/60 transition-colors text-left">
                    <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{n.desc}</p>
                    <span className="text-[8px] text-zinc-600 block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <ChevronDown size={14} className="text-zinc-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-4 py-3 border-b border-zinc-900">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-left"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-left"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-zinc-900 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
