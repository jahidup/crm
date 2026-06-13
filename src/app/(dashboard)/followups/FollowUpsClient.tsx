'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  List, 
  Columns, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone, 
  MessageSquare, 
  Mail, 
  Video, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  User,
  Sparkles,
  X
} from 'lucide-react';
import { createFollowup, updateFollowupStatus } from '@/lib/actions/followups';
import { toast } from '@/components/ui/Toast';

interface FollowUpsClientProps {
  followups: any[];
  leads: any[];
}

export default function FollowUpsClient({ followups, leads }: FollowUpsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [leadId, setLeadId] = useState('');
  const [fupDate, setFupDate] = useState('');
  const [fupTime, setFupTime] = useState('');
  const [fupType, setFupType] = useState<'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Notes'>('Call');
  const [fupNotes, setFupNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calendar Month states
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !fupDate || !fupTime) {
      toast.error('Scheduling Mismatch', 'Please select a client profile, date, and time.');
      return;
    }

    setSubmitting(true);
    const res = await createFollowup({
      leadId,
      date: fupDate,
      time: fupTime,
      type: fupType,
      notes: fupNotes,
    });

    if (res.success) {
      toast.success('Task Logged', 'Follow-up successfully booked.');
      setShowScheduleModal(false);
      // Reset
      setLeadId('');
      setFupDate('');
      setFupTime('');
      setFupNotes('');
      router.refresh();
    } else {
      toast.error('Scheduling failed', res.error);
    }
    setSubmitting(false);
  };

  const handleCompleteFup = async (fupId: string, leadId: string) => {
    const res = await updateFollowupStatus(fupId, 'Completed', leadId);
    if (res.success) {
      toast.success('Task Completed', 'Interaction logged successfully.');
      router.refresh();
    } else {
      toast.error('Action Failed', res.error);
    }
  };

  // Group followups
  const overdueFollowups = followups.filter(f => f.status === 'Overdue');
  const upcomingFollowups = followups.filter(f => f.status === 'Upcoming');
  const completedFollowups = followups.filter(f => f.status === 'Completed');

  // Type Icons helper
  const typeIcons: Record<string, any> = {
    Call: <Phone size={14} className="text-blue-500" />,
    WhatsApp: <MessageSquare size={14} className="text-emerald-500" />,
    Email: <Mail size={14} className="text-amber-500" />,
    Meeting: <Video size={14} className="text-purple-500" />,
    Notes: <List size={14} className="text-zinc-500" />,
  };

  // CALENDAR DRAWING UTILITIES
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendarDays = () => {
    const { firstDay, totalDays } = getDaysInMonth(currentDate);
    const days = [];
    
    // Fill leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-zinc-950/10 border border-zinc-900/40 opacity-30" />);
    }

    // Fill days
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = followups.filter(f => f.date === dateString);

      days.push(
        <div key={`day-${day}`} className="h-24 bg-zinc-950/20 border border-zinc-900/60 p-2 flex flex-col justify-between hover:bg-zinc-900/10 transition-colors">
          <span className="text-[10px] font-bold text-zinc-500">{day}</span>
          <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
            {dayTasks.map(task => (
              <Link
                key={task._id}
                href={`/leads/${task.leadId?._id}`}
                className={`text-[8px] font-semibold px-1 py-0.5 rounded truncate block hover:underline ${
                  task.status === 'Completed'
                    ? 'bg-zinc-900/60 text-zinc-500 border border-zinc-900'
                    : task.status === 'Overdue'
                    ? 'bg-red-950/30 text-red-400 border border-red-900/20'
                    : 'bg-blue-950/30 text-blue-400 border border-blue-900/20'
                }`}
              >
                {task.type}: {task.leadId?.name}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Interaction Manager</h2>
          <p className="text-xs text-zinc-500">Plan and track calls, emails, WhatsApp messages, and meetings.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'list' ? 'bg-zinc-900 text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List size={14} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'calendar' ? 'bg-zinc-900 text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Calendar size={14} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'kanban' ? 'bg-zinc-900 text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Columns size={14} />
              <span>Board</span>
            </button>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Book Task</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overdue column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={14} /> Overdue Tasks ({overdueFollowups.length})
              </span>
            </div>
            <div className="space-y-3">
              {overdueFollowups.map((task) => (
                <div key={task._id} className="p-4 bg-red-950/5 border border-red-900/20 rounded-xl hover:border-red-900/40 transition-colors flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/leads/${task.leadId?._id}`} className="text-xs font-bold text-white hover:text-blue-500 transition-colors">
                        {task.leadId?.name}
                      </Link>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        {typeIcons[task.type]} {task.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{task.notes || 'No description listed.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900/20">
                    <span className="text-[10px] font-bold text-red-400 font-mono">{task.date} ({task.time})</span>
                    <button
                      onClick={() => handleCompleteFup(task._id, task.leadId?._id)}
                      className="text-[9px] font-bold bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
              {overdueFollowups.length === 0 && (
                <p className="text-zinc-600 text-xs py-8 text-center bg-zinc-950/5 border border-zinc-900/30 rounded-xl">No overdue tasks.</p>
              )}
            </div>
          </div>

          {/* Upcoming column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} /> Upcoming Tasks ({upcomingFollowups.length})
              </span>
            </div>
            <div className="space-y-3">
              {upcomingFollowups.map((task) => (
                <div key={task._id} className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-colors flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/leads/${task.leadId?._id}`} className="text-xs font-bold text-white hover:text-blue-500 transition-colors">
                        {task.leadId?.name}
                      </Link>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        {typeIcons[task.type]} {task.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{task.notes || 'No description listed.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900/20">
                    <span className="text-[10px] font-bold text-blue-400 font-mono">{task.date} ({task.time})</span>
                    <button
                      onClick={() => handleCompleteFup(task._id, task.leadId?._id)}
                      className="text-[9px] font-bold bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
              {upcomingFollowups.length === 0 && (
                <p className="text-zinc-600 text-xs py-8 text-center bg-zinc-950/5 border border-zinc-900/30 rounded-xl">No upcoming tasks.</p>
              )}
            </div>
          </div>

          {/* Completed column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} /> Completed log ({completedFollowups.length})
              </span>
            </div>
            <div className="space-y-3">
              {completedFollowups.map((task) => (
                <div key={task._id} className="p-4 bg-zinc-950/20 border border-zinc-900/60 rounded-xl opacity-65 hover:opacity-100 transition-all flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/leads/${task.leadId?._id}`} className="text-xs font-bold text-zinc-300 hover:text-blue-500 transition-colors">
                        {task.leadId?.name}
                      </Link>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        {typeIcons[task.type]} {task.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{task.notes || 'No description listed.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900/20">
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono">{task.date} ({task.time})</span>
                    <span className="text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Done
                    </span>
                  </div>
                </div>
              ))}
              {completedFollowups.length === 0 && (
                <p className="text-zinc-600 text-xs py-8 text-center bg-zinc-950/5 border border-zinc-900/30 rounded-xl">No logged interactions.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/10">
          {/* Calendar Header Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 p-1 rounded-lg">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-px mb-px bg-zinc-900 text-[10px] text-zinc-500 font-bold uppercase text-center py-2 rounded-t-lg">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-zinc-900 rounded-b-lg overflow-hidden">
            {renderCalendarDays()}
          </div>
        </div>
      )}

      {/* VIEW 3: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columns matching List logic */}
          {['Overdue', 'Upcoming', 'Completed'].map((stage) => {
            const stageTasks = followups.filter(f => f.status === stage);
            
            return (
              <div key={stage} className="glass-panel p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{stage}</span>
                  <span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-mono">{stageTasks.length}</span>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] scrollbar-thin">
                  {stageTasks.map(task => (
                    <div
                      key={task._id}
                      className="p-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all cursor-grab active:cursor-grabbing text-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/leads/${task.leadId?._id}`} className="font-bold text-zinc-200 hover:text-blue-500 transition-colors truncate">
                          {task.leadId?.name}
                        </Link>
                        <span className="text-[9px] text-zinc-500 shrink-0 uppercase tracking-widest">{task.type}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 leading-normal">{task.notes || 'No description listed.'}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                        <span className="text-[8px] text-zinc-600 font-bold font-mono">{task.date} ({task.time})</span>
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleCompleteFup(task._id, task.leadId?._id)}
                            className="text-[9px] font-bold bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white px-1.5 py-0.5 rounded transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center py-12 text-zinc-600 text-xs text-center border-2 border-dashed border-zinc-900 rounded-xl">
                      Drag tasks here to update.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Followup Modal Backdrop & Dialog */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Book Follow-Up Action</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Select Client Profile *</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-900 focus:border-blue-500 text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose Client Lead --</option>
                  {leads.map(lead => (
                    <option key={lead._id} value={lead._id} className="bg-zinc-950">
                      {lead.name} ({lead.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    value={fupDate}
                    onChange={(e) => setFupDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Time *</label>
                  <input
                    type="time"
                    value={fupTime}
                    onChange={(e) => setFupTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Task Category</label>
                <select
                  value={fupType}
                  onChange={(e: any) => setFupType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="Call">Call (Phone Dialout)</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email Outreach</option>
                  <option value="Meeting">Meeting Conference</option>
                  <option value="Notes">Internal Memo / Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Task Notes</label>
                <textarea
                  value={fupNotes}
                  onChange={(e) => setFupNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-900 focus:border-blue-500 text-white rounded-lg px-3 py-2 outline-none resize-none"
                  placeholder="Summarize goals for this interaction..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Book Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
