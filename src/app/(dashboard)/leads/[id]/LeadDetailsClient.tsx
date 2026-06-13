'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Bot, 
  Send, 
  Clock, 
  Plus, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Copy,
  RotateCcw,
  Check,
  ChevronRight,
  TrendingUp,
  User,
  MoreVertical
} from 'lucide-react';
import { createFollowup, updateFollowupStatus } from '@/lib/actions/followups';
import { toast } from '@/components/ui/Toast';

interface LeadDetailsClientProps {
  lead: any;
  activities: any[];
  followups: any[];
  initialChatHistory: any[];
}

export default function LeadDetailsClient({ 
  lead, 
  activities, 
  followups, 
  initialChatHistory 
}: LeadDetailsClientProps) {
  const router = useRouter();
  
  // Center panel active tab
  const [centerTab, setCenterTab] = useState<'timeline' | 'notes' | 'followups'>('timeline');

  // AI chat states
  const [chatMessages, setChatMessages] = useState<any[]>(initialChatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New followup form state
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [fupType, setFupType] = useState<'Call' | 'WhatsApp' | 'Email' | 'Meeting'>('Call');
  const [fupDate, setFupDate] = useState('');
  const [fupTime, setFupTime] = useState('');
  const [fupNotes, setFupNotes] = useState('');
  const [submittingFup, setSubmittingFup] = useState(false);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Handle Quick Advisor button click
  const handleQuickAction = async (action: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'user', content: `[AI Advisor Trigger]: ${action.toUpperCase()}`, timestamp: new Date() },
          { sender: 'ai', content: data.text, timestamp: new Date() },
        ]);
        toast.success('AI Advisor Completed', 'Analysis report rendered in advisor panel.');
      } else {
        toast.error('AI Strategy Failed', data.error);
      }
    } catch (e) {
      toast.error('Strategy Engine Offline', 'Please check server connections.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Custom Message Submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { sender: 'user', content: msg, timestamp: new Date() }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id, message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [...prev, { sender: 'ai', content: data.text, timestamp: new Date() }]);
      } else {
        toast.error('AI Advisor Refused', data.error);
      }
    } catch (e) {
      toast.error('AI chat failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Copy advisor response to clipboard
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    toast.success('Copied', 'Consultant notes copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create Followup Form Submit
  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fupDate || !fupTime) {
      toast.error('Scheduling Mismatch', 'Date and time variables are required.');
      return;
    }

    setSubmittingFup(true);
    const res = await createFollowup({
      leadId: lead._id,
      date: fupDate,
      time: fupTime,
      type: fupType,
      notes: fupNotes,
    });

    if (res.success) {
      toast.success('Follow-Up Set', `Successfully scheduled ${fupType} task.`);
      setShowAddFollowup(false);
      setFupNotes('');
      setFupDate('');
      setFupTime('');
      router.refresh();
    } else {
      toast.error('Followup failure', res.error);
    }
    setSubmittingFup(false);
  };

  // Complete Followup status
  const handleCompleteFollowup = async (fupId: string) => {
    const res = await updateFollowupStatus(fupId, 'Completed', lead._id);
    if (res.success) {
      toast.success('Follow-Up Logged', 'Task state updated to Completed.');
      router.refresh();
    } else {
      toast.error('Task logging error', res.error);
    }
  };

  // High-fidelity Markdown-like Formatter for Advisor chat
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // H3 title
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-xs font-bold text-white mt-4 mb-2 tracking-wider uppercase border-b border-zinc-900 pb-1">{trimmed.replace('###', '')}</h4>;
      }
      // Bold items
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <p key={idx} className="text-xs font-semibold text-blue-400 mt-2">{trimmed.replace(/\*\*/g, '')}</p>;
      }
      // Bullet items
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="text-xs text-zinc-300 ml-4 list-disc mt-1.5 leading-relaxed">
            {trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      }
      // Empty lines
      if (trimmed === '') return <div key={idx} className="h-2" />;

      // Normal paragraph text
      const inlineBoldParsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p 
          key={idx} 
          className="text-xs text-zinc-400 mt-1.5 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineBoldParsed }}
        />
      );
    });
  };

  // Helper colors
  const statusColors: Record<string, string> = {
    'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Interested': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Discovery Call': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Proposal Sent': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Negotiation': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const priorityColors: Record<string, string> = {
    'High': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Low': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
      {/* 3-Panel Layout Grid: LEFT (3 cols) | CENTER (5 cols) | RIGHT (4 cols) */}

      {/* LEFT PANEL: Client Profile */}
      <div className="xl:col-span-3 space-y-6 flex flex-col justify-start">
        {/* Core Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex flex-col relative">
          <div className="absolute top-4 right-4">
            <span className={`text-[8px] font-extrabold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[lead.priority] || ''}`}>
              {lead.priority}
            </span>
          </div>

          <div className="flex flex-col items-center text-center mt-2 border-b border-zinc-900/60 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-extrabold text-lg shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-4">
              {lead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
            <h3 className="text-sm font-bold text-white">{lead.name}</h3>
            <span className="text-[10px] text-zinc-500 font-semibold mt-1 uppercase tracking-wider">{lead.company}</span>
            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full mt-3 uppercase tracking-widest ${statusColors[lead.status] || ''}`}>
              {lead.status}
            </span>
          </div>

          {/* Business & Contact Details */}
          <div className="py-6 space-y-4 border-b border-zinc-900/60 text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <Building size={14} className="text-zinc-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider leading-none">Industry</span>
                <span className="font-semibold text-white mt-0.5 block truncate">{lead.industry || 'Not set'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <Mail size={14} className="text-zinc-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider leading-none">Email</span>
                <a href={`mailto:${lead.email}`} className="font-semibold text-white hover:text-blue-500 transition-colors mt-0.5 block truncate font-mono">
                  {lead.email || 'No email registered'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <Phone size={14} className="text-zinc-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider leading-none">Phone</span>
                <span className="font-semibold text-white font-mono mt-0.5 block truncate">{lead.phone || 'No phone set'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <MapPin size={14} className="text-zinc-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider leading-none">HQ Location</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {lead.business?.city ? `${lead.business.city}, ` : ''}{lead.business?.country || 'Unknown Location'}
                </span>
              </div>
            </div>

            {lead.website && (
              <div className="flex items-center gap-3 text-zinc-400">
                <Globe size={14} className="text-zinc-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider leading-none">Website</span>
                  <a href={lead.website} target="_blank" rel="noreferrer" className="font-semibold text-blue-500 hover:underline mt-0.5 block truncate">
                    {lead.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Social Profiles Grid */}
          <div className="pt-6 space-y-3">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Social Channels</span>
            <div className="flex items-center gap-2">
              {lead.socials?.linkedIn && (
                <a href={lead.socials.linkedIn} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg hover:border-zinc-700 transition-colors" title="LinkedIn">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {lead.socials?.instagram && (
                <a href={lead.socials.instagram} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg hover:border-zinc-700 transition-colors" title="Instagram">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
              )}
              {lead.socials?.facebook && (
                <a href={lead.socials.facebook} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg hover:border-zinc-700 transition-colors" title="Facebook">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {lead.socials?.twitter && (
                <a href={lead.socials.twitter} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg hover:border-zinc-700 transition-colors" title="Twitter/X">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {lead.socials?.youtube && (
                <a href={lead.socials.youtube} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg hover:border-zinc-700 transition-colors" title="YouTube">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {Object.values(lead.socials || {}).filter(Boolean).length === 0 && (
                <span className="text-[10px] text-zinc-600 block">No channels linked.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Activity Timeline / Notes / Meetings */}
      <div className="xl:col-span-5 flex flex-col justify-start">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex-1 flex flex-col">
          {/* Header Panel Tabs */}
          <div className="flex border-b border-zinc-900 pb-px mb-6">
            <button
              onClick={() => setCenterTab('timeline')}
              className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                centerTab === 'timeline' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Timeline History
            </button>
            <button
              onClick={() => setCenterTab('notes')}
              className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                centerTab === 'notes' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Lead Notes
            </button>
            <button
              onClick={() => setCenterTab('followups')}
              className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                centerTab === 'followups' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Follow-Ups
            </button>
          </div>

          {/* TAB 1: Activity Timeline */}
          {centerTab === 'timeline' && (
            <div className="space-y-4 flex-1">
              <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900 pl-7 space-y-5">
                {activities.map((act) => {
                  let circleColor = 'bg-zinc-800 border-zinc-700 text-zinc-500';
                  if (act.type === 'opportunity_won') circleColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
                  if (act.type === 'status_changed') circleColor = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
                  if (act.type === 'lead_created') circleColor = 'bg-blue-500/10 border-blue-500/30 text-blue-500';
                  
                  return (
                    <div key={act._id} className="relative text-xs">
                      <div className={`absolute -left-5.5 top-0.5 w-3.5 h-3.5 rounded-full border ${circleColor} flex items-center justify-center`} />
                      <div className="bg-zinc-950/20 border border-zinc-900/40 p-3 rounded-xl hover:border-zinc-900 transition-colors">
                        <p className="text-zinc-300 leading-normal">{act.description}</p>
                        <span className="text-[9px] text-zinc-600 block mt-1.5 font-mono">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-8">No activities logged yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Notes & Business description */}
          {centerTab === 'notes' && (
            <div className="space-y-6 flex-1 text-xs">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Business Description</span>
                <p className="text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">
                  {lead.business?.description || 'No business description provided for this profile.'}
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Internal Team Notes</span>
                <p className="text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">
                  {lead.notes || 'No internal team notes listed.'}
                </p>
              </div>

              {lead.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag: string) => (
                    <span key={tag} className="bg-blue-950/30 text-blue-400 border border-blue-900/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Followups Listing and Create Form */}
          {centerTab === 'followups' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-900/40 pb-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Scheduled Interactions</span>
                <button
                  onClick={() => setShowAddFollowup(!showAddFollowup)}
                  className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  <span>Schedule Task</span>
                </button>
              </div>

              {/* Schedule Followup Dropdown Panel */}
              {showAddFollowup && (
                <form onSubmit={handleAddFollowup} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Interaction Type</label>
                      <select
                        value={fupType}
                        onChange={(e: any) => setFupType(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-1.5 text-xs focus:ring-0 outline-none"
                      >
                        <option value="Call">Call</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={fupDate}
                        onChange={(e) => setFupDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-1.5 text-xs outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Time</label>
                      <input
                        type="time"
                        value={fupTime}
                        onChange={(e) => setFupTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-1.5 text-xs outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Task Details</label>
                    <textarea
                      value={fupNotes}
                      onChange={(e) => setFupNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2 text-xs outline-none resize-none"
                      placeholder="Outline topics to discuss..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFollowup(false)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingFup}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50"
                    >
                      {submittingFup ? 'Saving...' : 'Book Task'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2.5 flex-1">
                {followups.map((fup) => (
                  <div
                    key={fup._id}
                    className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{fup.type} Interaction</span>
                        <span className={`text-[8px] font-extrabold px-1.5 rounded uppercase tracking-wider ${
                          fup.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {fup.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 truncate">{fup.notes || 'No description listed.'}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-300 font-bold block">{fup.date}</span>
                        <span className="text-[8px] text-zinc-500 font-mono block mt-0.5">{fup.time}</span>
                      </div>
                      
                      {fup.status !== 'Completed' && (
                        <button
                          onClick={() => handleCompleteFollowup(fup._id)}
                          className="text-[9px] font-extrabold bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Log Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {followups.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-8">No interactions scheduled.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: AI Business Advisor Chat panel */}
      <div className="xl:col-span-4 flex flex-col justify-start">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 h-[500px] xl:h-full flex flex-col justify-between">
          
          {/* Panel Header */}
          <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
            <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Bot size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Business Consultant</h3>
              <p className="text-[9px] text-zinc-500 mt-0.5">Gemini strategist mapping company contracts</p>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin scroll-smooth pr-1">
            {chatMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 border text-xs shadow-md relative group ${
                    isUser
                      ? 'bg-blue-600/10 border-blue-500/20 text-white rounded-tr-none'
                      : 'bg-zinc-900/40 border-zinc-900 text-zinc-300 rounded-tl-none'
                  }`}>
                    {/* Message Header formatting */}
                    {isUser ? (
                      <p className="text-[10px] text-zinc-400 font-bold mb-1.5 tracking-wider uppercase font-mono">Sales Rep</p>
                    ) : (
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-blue-500 font-bold tracking-wider uppercase flex items-center gap-1">
                          <Sparkles size={10} className="animate-pulse" /> Advisor
                        </span>
                        
                        {/* Action buttons (Copy/Regen) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyText(msg.content, `${index}`)}
                            className="p-1 hover:bg-zinc-950 text-zinc-500 hover:text-white rounded transition-colors"
                            title="Copy analysis"
                          >
                            {copiedId === `${index}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                          </button>
                          <button
                            onClick={() => handleQuickAction('analyze')}
                            className="p-1 hover:bg-zinc-950 text-zinc-500 hover:text-white rounded transition-colors"
                            title="Regenerate strategy"
                          >
                            <RotateCcw size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Render Formatted Markdown */}
                    <div className="space-y-1">
                      {isUser ? <p className="leading-relaxed font-semibold">{msg.content}</p> : formatMarkdown(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* AI Loading state placeholder */}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/40 border-zinc-900 max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 border text-xs text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                  <span className="text-[10px] text-zinc-500 font-medium font-mono ml-1 uppercase">Parsing models...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action buttons */}
          {chatMessages.length <= 1 && (
            <div className="py-2 border-t border-zinc-900/60">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Suggested consultant actions</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'analyze', text: 'Analyze Business' },
                  { id: 'strategy', text: 'Generate Strategy' },
                  { id: 'outreach', text: 'Outreach Templates' },
                  { id: 'proposal', text: 'Draft Proposal' },
                  { id: 'budget', text: 'Estimate Budget' },
                  { id: 'meeting', text: 'Meeting Prep' },
                  { id: 'score', text: 'Lead Score' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleQuickAction(act.id)}
                    className="text-[9px] font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {act.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input box */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-zinc-900">
            <input
              type="text"
              placeholder="Ask custom sales questions..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl px-3 py-2 outline-none"
              disabled={isAiLoading}
            />
            <button
              type="submit"
              disabled={isAiLoading || !inputMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
