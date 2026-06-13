'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Home, Users, Calendar, BarChart3, Bot, Settings, Plus, User } from 'lucide-react';

interface CommandPaletteProps {
  onOpenLeadDrawer?: () => void;
  onOpenFollowupModal?: () => void;
}

export default function CommandPalette({ onOpenLeadDrawer, onOpenFollowupModal }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
      // Fetch dynamic leads for fast searching
      fetch('/api/leads-search')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setLeads(data);
        })
        .catch(() => {});
    } else {
      document.body.style.overflow = 'unset';
      setSearch('');
    }
  }, [isOpen]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleCommand = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      name: 'Open Dashboard',
      icon: Home,
      shortcut: 'G + D',
      perform: () => router.push('/'),
    },
    {
      name: 'Open Leads List',
      icon: Users,
      shortcut: 'G + L',
      perform: () => router.push('/leads'),
    },
    {
      name: 'Create New Lead',
      icon: Plus,
      shortcut: 'C + L',
      perform: () => {
        if (onOpenLeadDrawer) {
          onOpenLeadDrawer();
        } else {
          router.push('/leads?create=true');
        }
      },
    },
    {
      name: 'Open Followups Calendar',
      icon: Calendar,
      shortcut: 'G + F',
      perform: () => router.push('/followups'),
    },
    {
      name: 'Create New Followup',
      icon: Plus,
      shortcut: 'C + F',
      perform: () => {
        if (onOpenFollowupModal) {
          onOpenFollowupModal();
        } else {
          router.push('/followups?create=true');
        }
      },
    },
    {
      name: 'Open AI Assistant',
      icon: Bot,
      shortcut: 'G + A',
      perform: () => router.push('/ai-assistant'),
    },
    {
      name: 'Open Sales Analytics',
      icon: BarChart3,
      shortcut: 'G + Y',
      perform: () => router.push('/analytics'),
    },
    {
      name: 'Open Admin Settings',
      icon: Settings,
      shortcut: 'G + S',
      perform: () => router.push('/settings'),
    },
  ];

  const filteredActions = actions.filter((act) =>
    act.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.company.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/70 backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-900">
          <Search className="text-zinc-500 mr-3 shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search client leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm border-none outline-none focus:ring-0"
          />
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono select-none">
            ESC
          </span>
        </div>

        {/* Options List */}
        <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
          {search && filteredLeads.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Leads Found
              </div>
              {filteredLeads.slice(0, 5).map((lead) => (
                <button
                  key={lead._id}
                  onClick={() => handleCommand(() => router.push(`/leads/${lead._id}`))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-zinc-500" />
                    <div>
                      <span className="font-medium">{lead.name}</span>
                      <span className="text-xs text-zinc-500 ml-2">({lead.company})</span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-500 bg-blue-950/40 border border-blue-900/30 px-1.5 py-0.5 rounded">
                    {lead.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Quick Navigation & Commands
            </div>
            {filteredActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.name}
                  onClick={() => handleCommand(act.perform)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-zinc-500" />
                    <span>{act.name}</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                    {act.shortcut}
                  </kbd>
                </button>
              );
            })}
            {filteredActions.length === 0 && filteredLeads.length === 0 && (
              <div className="p-4 text-center text-sm text-zinc-500">
                No matching results found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
