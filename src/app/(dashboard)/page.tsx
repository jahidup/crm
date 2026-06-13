import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Opportunity } from '@/lib/models/Opportunity';
import { Followup } from '@/lib/models/Followup';
import { Activity } from '@/lib/models/Activity';
import { DashboardCharts } from '@/components/DashboardCharts';
import { 
  Users, 
  ThumbsUp, 
  Award, 
  TrendingUp, 
  Calendar, 
  MessageSquareCode, 
  Plus, 
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Bot
} from 'lucide-react';

export default async function DashboardPage() {
  await connectToDatabase();

  // Retrieve KPI metrics
  const totalLeads = await Lead.countDocuments({});
  const interestedLeads = await Lead.countDocuments({ 
    status: { $in: ['Interested', 'Discovery Call', 'Proposal Sent', 'Negotiation'] } 
  });
  const wonClients = await Lead.countDocuments({ status: 'Won' });

  // Calculate dynamic revenue potential (sum of Won budgets + 50% probability estimation of other opportunities)
  const opportunities = await Opportunity.find({});
  let revenueVal = 0;
  opportunities.forEach((opp) => {
    if (opp.pipelineStage === 'Won') {
      revenueVal += opp.finalBudget || opp.estimatedBudget;
    } else if (opp.pipelineStage !== 'Lost') {
      // Add portion of budget based on probability
      revenueVal += opp.estimatedBudget * ((opp.probability || 50) / 100);
    }
  });

  // Format revenue in Indian Rupees Lakhs format (₹ Lakhs)
  const revenueLakhs = (revenueVal / 100000).toFixed(1);
  const formattedRevenue = `₹${revenueLakhs}L`;

  // Fetch recent leads
  const recentLeads = await Lead.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Fetch upcoming followups
  const upcomingFollowups = await Followup.find({ status: 'Upcoming' })
    .populate('leadId')
    .sort({ date: 1, time: 1 })
    .limit(5)
    .lean();

  // Fetch recent activities
  const recentActivities = await Activity.find({})
    .populate('leadId')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Generate dynamic AI Suggestions based on database state
  const aiSuggestions: { title: string; desc: string; actionText: string; actionUrl: string }[] = [];
  
  if (upcomingFollowups.length > 0) {
    const nextFup: any = upcomingFollowups[0];
    const leadName = nextFup.leadId?.name || 'Client';
    aiSuggestions.push({
      title: 'Prepare Discovery Meeting',
      desc: `Scheduled meeting with ${leadName} tomorrow. Draft talking points and discovery questions.`,
      actionText: 'Meeting Preparation',
      actionUrl: `/leads/${nextFup.leadId?._id || ''}?action=meet`,
    });
  }

  // Look for leads in proposal sent stage
  const proposalLeads = await Lead.find({ status: 'Proposal Sent' }).limit(1).lean();
  if (proposalLeads.length > 0) {
    aiSuggestions.push({
      title: 'Outreach Followup Draft',
      desc: `Wayne Enterprises has proposal sent. Send custom outreach message to follow up.`,
      actionText: 'Generate Outreach',
      actionUrl: `/leads/${proposalLeads[0]._id}?action=outreach`,
    });
  }

  // General advisor seed suggestion
  if (aiSuggestions.length < 3) {
    aiSuggestions.push({
      title: 'Analyze Business Strengths',
      desc: 'Complete AI Sales Audits on newly imported leads to identify contract options.',
      actionText: 'Auditor Tool',
      actionUrl: '/leads',
    });
  }

  // Construct charts data
  const funnelData = [
    { stage: 'New Leads', count: await Lead.countDocuments({ status: 'New Lead' }), percentage: 100 },
    { stage: 'Contacted', count: await Lead.countDocuments({ status: 'Contacted' }), percentage: 80 },
    { stage: 'Proposals', count: await Lead.countDocuments({ status: 'Proposal Sent' }), percentage: 45 },
    { stage: 'Won', count: wonClients, percentage: Math.round((wonClients / (totalLeads || 1)) * 100) },
  ];

  const growthData = [
    { month: 'Jan', leads: 4, won: 1 },
    { month: 'Feb', leads: 8, won: 2 },
    { month: 'Mar', leads: 15, won: 3 },
    { month: 'Apr', leads: 22, won: 5 },
    { month: 'May', leads: 28, won: 7 },
    { month: 'Jun', leads: totalLeads || 35, won: wonClients || 12 },
  ];

  // Helper styles for badges
  const priorityColors: Record<string, string> = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

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

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sales Command</h2>
          <p className="text-xs text-zinc-500">Real-time overview of your sales performance and tasks.</p>
        </div>
        <Link
          href="/leads?create=true"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-950/40 hover:shadow-blue-500/10 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Client Lead</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="glass-card p-6 rounded-xl border border-zinc-900 bg-zinc-950/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Leads</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalLeads}</span>
            <span className="text-[10px] text-green-500 flex items-center gap-0.5">
              <TrendingUp size={10} /> +12%
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">Total database sales records</p>
        </div>

        {/* Card 2: Interested */}
        <div className="glass-card p-6 rounded-xl border border-zinc-900 bg-zinc-950/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Funnel</span>
            <ThumbsUp size={16} className="text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{interestedLeads}</span>
            <span className="text-[10px] text-green-500 flex items-center gap-0.5">
              <TrendingUp size={10} /> +8%
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">Leads expressing interest</p>
        </div>

        {/* Card 3: Won Clients */}
        <div className="glass-card p-6 rounded-xl border border-zinc-900 bg-zinc-950/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Won Clients</span>
            <Award size={16} className="text-yellow-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{wonClients}</span>
            <span className="text-[10px] text-green-500 flex items-center gap-0.5">
              <TrendingUp size={10} /> +24%
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">Contracts fully executed</p>
        </div>

        {/* Card 4: Revenue */}
        <div className="glass-card p-6 rounded-xl border border-zinc-900 bg-zinc-950/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Value</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{formattedRevenue}</span>
            <span className="text-[10px] text-zinc-500 font-semibold font-mono">
              EST. POTENTIAL
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">Expected weighted deal sizes</p>
        </div>
      </div>

      {/* Row 1 Charts */}
      <DashboardCharts funnelData={funnelData} growthData={growthData} />

      {/* Row 2 Grid: Recent Leads & Upcoming Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Client Leads</h3>
              <p className="text-xs text-zinc-500">Newly captured profiles</p>
            </div>
            <Link
              href="/leads"
              className="text-[10px] text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={10} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="py-2">Client / Company</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead: any) => (
                  <tr key={lead._id} className="border-b border-zinc-900/50 hover:bg-zinc-900/10 text-xs">
                    <td className="py-3">
                      <Link href={`/leads/${lead._id}`} className="font-semibold text-white hover:text-blue-500 transition-colors block">
                        {lead.name}
                      </Link>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{lead.company}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${statusColors[lead.status] || ''}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${priorityColors[lead.priority] || ''}`}>
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-xs">
                      No leads registered. Click "New Client Lead" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Followups */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Upcoming Follow-Ups</h3>
              <p className="text-xs text-zinc-500">Tasks requiring immediate attention</p>
            </div>
            <Link
              href="/followups"
              className="text-[10px] text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Calendar</span>
              <ChevronRight size={10} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {upcomingFollowups.map((f: any) => (
              <div
                key={f._id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-900 hover:bg-zinc-900/60 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {f.type} with {f.leadId?.name || 'Unknown Client'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{f.notes || 'No description provided.'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-blue-500 block">{f.date}</span>
                  <span className="text-[8px] text-zinc-500 block font-mono mt-0.5">{f.time}</span>
                </div>
              </div>
            ))}
            {upcomingFollowups.length === 0 && (
              <div className="h-full flex items-center justify-center py-8 text-zinc-500 text-xs">
                No upcoming follow-ups scheduled.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 Grid: AI Suggestions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggestions Widget */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
            <Bot size={18} className="text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-white">AI Suggestion Core</h3>
              <p className="text-xs text-zinc-500">Autonomous sales assistance and next-steps</p>
            </div>
          </div>

          <div className="space-y-3">
            {aiSuggestions.map((s, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-950 border border-zinc-900 hover:border-blue-900/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all duration-300 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">{s.desc}</p>
                </div>
                <Link
                  href={s.actionUrl}
                  className="text-[9px] font-extrabold bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors shrink-0 uppercase tracking-wider flex items-center gap-1"
                >
                  <span>Action</span>
                  <ExternalLink size={10} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Audit Activity Stream</h3>
              <p className="text-xs text-zinc-500">Log of changes and actions taken</p>
            </div>
            <Clock size={16} className="text-zinc-600" />
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900">
            {recentActivities.map((act: any) => {
              let circleColor = 'bg-zinc-800 border-zinc-700 text-zinc-500';
              if (act.type === 'opportunity_won') circleColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
              if (act.type === 'status_changed') circleColor = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
              if (act.type === 'lead_created') circleColor = 'bg-blue-500/10 border-blue-500/30 text-blue-500';
              
              return (
                <div key={act._id} className="flex gap-4 relative pl-7 text-xs">
                  <div className={`absolute left-1.5 top-0.5 w-3 h-3 rounded-full border ${circleColor} flex items-center justify-center`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 leading-normal">{act.description}</p>
                    <span className="text-[9px] text-zinc-600 block mt-1">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
