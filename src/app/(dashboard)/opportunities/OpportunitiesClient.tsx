'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, X, Landmark, TrendingUp, Calendar, AlertCircle, ArrowRight, User } from 'lucide-react';
import { createOpportunity, updateOpportunityStage } from '@/lib/actions/opportunities';
import { toast } from '@/components/ui/Toast';
import confetti from 'canvas-confetti';

interface OpportunitiesClientProps {
  opportunities: any[];
  leads: any[];
}

export default function OpportunitiesClient({ opportunities, leads }: OpportunitiesClientProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  
  // Columns
  const columns = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  // Form State
  const [leadId, setLeadId] = useState('');
  const [serviceOffered, setServiceOffered] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [probability, setProbability] = useState('50');
  const [closingDate, setClosingDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (oppId: string) => {
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: string) => {
    if (!draggedOppId) return;
    
    // Optimistic UI updates can be handled, but Server Action is very fast
    const res = await updateOpportunityStage(draggedOppId, stage);
    if (res.success) {
      if (stage === 'Won') {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Deal Closed!', 'Opportunity successfully won!');
      } else {
        toast.success('Pipeline Updated', `Moved to ${stage}.`);
      }
      router.refresh();
    } else {
      toast.error('Failed to move deal', res.error);
    }
    setDraggedOppId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !serviceOffered || !estimatedBudget || !closingDate) {
      toast.error('Missing details', 'Please fill in all required opportunity fields.');
      return;
    }

    setSubmitting(true);
    const res = await createOpportunity({
      leadId,
      serviceOffered,
      estimatedBudget,
      probability,
      expectedClosingDate: closingDate,
      pipelineStage: 'Prospect',
    });

    if (res.success) {
      toast.success('Opportunity Created', 'Deal pipeline card registered.');
      setShowAddModal(false);
      // Reset
      setLeadId('');
      setServiceOffered('');
      setEstimatedBudget('');
      setProbability('50');
      setClosingDate('');
      router.refresh();
    } else {
      toast.error('Registration failed', res.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Deal Pipeline</h2>
          <p className="text-xs text-zinc-500">Drag and drop deal opportunities across sales cycles to finalize budgets.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Deal Card</span>
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin min-h-[500px]">
        {columns.map((col) => {
          const colOpps = opportunities.filter(o => o.pipelineStage === col);
          const colBudgetSum = colOpps.reduce((sum, o) => sum + (o.estimatedBudget || 0), 0);

          let columnHeaderClass = 'text-zinc-500 bg-zinc-950 border-zinc-900';
          if (col === 'Won') columnHeaderClass = 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20';
          if (col === 'Lost') columnHeaderClass = 'text-red-400 bg-red-950/10 border-red-900/20';

          return (
            <div
              key={col}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col)}
              className="flex-1 min-w-[280px] max-w-[320px] bg-zinc-950/20 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div className={`flex items-center justify-between p-2 rounded-lg border ${columnHeaderClass} text-xs font-bold uppercase tracking-wider mb-4`}>
                  <span>{col}</span>
                  <span className="font-mono text-[10px] bg-zinc-900/60 text-zinc-500 px-1.5 py-0.5 rounded-md">
                    {colOpps.length}
                  </span>
                </div>

                {/* Column Budget Summary */}
                {colBudgetSum > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-3 px-1 font-semibold">
                    <span>Stage Value:</span>
                    <span className="text-zinc-300">₹{(colBudgetSum / 100000).toFixed(2)}L</span>
                  </div>
                )}

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-0.5 scrollbar-thin">
                  {colOpps.map((opp) => (
                    <div
                      key={opp._id}
                      draggable
                      onDragStart={() => handleDragStart(opp._id)}
                      className={`p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all cursor-grab active:cursor-grabbing text-xs space-y-3 relative group ${
                        draggedOppId === opp._id ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/leads/${opp.leadId?._id}`} className="font-bold text-white hover:text-blue-500 transition-colors block truncate">
                          {opp.leadId?.name}
                        </Link>
                        <span className="text-[9px] text-zinc-500 shrink-0 font-mono">
                          {opp.probability}%
                        </span>
                      </div>

                      <div>
                        <h4 className="text-[10px] text-zinc-400 font-semibold leading-normal">{opp.serviceOffered}</h4>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">{opp.leadId?.company}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50">
                        <span className="text-xs font-bold text-white">₹{(opp.estimatedBudget / 100000).toFixed(1)}L</span>
                        <span className="text-[8px] text-zinc-500 font-bold font-mono">{opp.expectedClosingDate}</span>
                      </div>
                    </div>
                  ))}
                  {colOpps.length === 0 && (
                    <div className="h-full py-16 text-center text-[10px] text-zinc-600 border-2 border-dashed border-zinc-900/50 rounded-xl flex items-center justify-center">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add Deal Opportunity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Select Client Lead *</label>
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

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Service Offered *</label>
                <input
                  type="text"
                  value={serviceOffered}
                  onChange={(e) => setServiceOffered(e.target.value)}
                  placeholder="e.g. Enterprise SaaS CRM Deployment"
                  className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Est. Budget (₹ Rupees) *</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="e.g. 450000"
                    className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Expected Closing Date *</label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-900 text-white rounded-lg px-3 py-2 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
