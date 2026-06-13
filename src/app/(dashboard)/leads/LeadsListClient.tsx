'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Table, 
  Grid, 
  MoreVertical, 
  User, 
  Briefcase, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  FileSpreadsheet,
  Globe,
  Sparkles,
  Bot
} from 'lucide-react';
import { createLead, updateLead, deleteLead } from '@/lib/actions/leads';
import { toast } from '@/components/ui/Toast';
import Drawer from '@/components/ui/Drawer';

interface LeadsListClientProps {
  initialLeads: any[];
}

export default function LeadsListClient({ initialLeads }: LeadsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  
  // Tabs inside drawer
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'social' | 'business' | 'notes'>('basic');

  // Search, Filters & View states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected leads for bulk actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Action menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: '',
    category: 'Enterprise',
    website: '',
    contactPerson: '',
    email: '',
    phone: '',
    whatsApp: '',
    linkedIn: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    country: '',
    city: '',
    description: '',
    status: 'New Lead',
    priority: 'Medium',
    notes: '',
    tags: '',
  });

  // Open drawer for creation if URL has create=true query
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleOpenCreate();
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setDrawerMode('create');
    setCurrentLeadId(null);
    setFormData({
      name: '',
      company: '',
      industry: '',
      category: 'Enterprise',
      website: '',
      contactPerson: '',
      email: '',
      phone: '',
      whatsApp: '',
      linkedIn: '',
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
      country: '',
      city: '',
      description: '',
      status: 'New Lead',
      priority: 'Medium',
      notes: '',
      tags: '',
    });
    setActiveTab('basic');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (lead: any) => {
    setDrawerMode('edit');
    setCurrentLeadId(lead._id);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      industry: lead.industry || '',
      category: lead.category || 'Enterprise',
      website: lead.website || '',
      contactPerson: lead.contactPerson || '',
      email: lead.email || '',
      phone: lead.phone || '',
      whatsApp: lead.whatsApp || '',
      linkedIn: lead.socials?.linkedIn || '',
      instagram: lead.socials?.instagram || '',
      facebook: lead.socials?.facebook || '',
      twitter: lead.socials?.twitter || '',
      youtube: lead.socials?.youtube || '',
      country: lead.business?.country || '',
      city: lead.business?.city || '',
      description: lead.business?.description || '',
      status: lead.status || 'New Lead',
      priority: lead.priority || 'Medium',
      notes: lead.notes || '',
      tags: lead.tags?.join(', ') || '',
    });
    setActiveTab('basic');
    setIsDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      const res = await deleteLead(leadId);
      if (res.success) {
        toast.success('Lead deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete lead', res.error);
      }
      setActiveMenuId(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      toast.error('Validation Error', 'Client name and company name are required.');
      return;
    }

    if (drawerMode === 'create') {
      const res = await createLead(formData);
      if (res.success) {
        toast.success('Lead Created', `${formData.name} was successfully registered.`);
        setIsDrawerOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to create lead', res.error);
      }
    } else if (drawerMode === 'edit' && currentLeadId) {
      const res = await updateLead(currentLeadId, formData);
      if (res.success) {
        toast.success('Lead Updated', 'Changes saved successfully.');
        setIsDrawerOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to update lead', res.error);
      }
    }
  };

  // Filter lists
  const filteredLeads = initialLeads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      (lead.industry && lead.industry.toLowerCase().includes(search.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Paginated elements
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Bulk actions handlers
  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === currentItems.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentItems.map((item) => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedLeads.length} selected leads?`)) {
      let failCount = 0;
      for (const id of selectedLeads) {
        const res = await deleteLead(id);
        if (!res.success) failCount++;
      }
      if (failCount === 0) {
        toast.success('Bulk Delete Complete', `Successfully removed ${selectedLeads.length} leads.`);
      } else {
        toast.warning('Bulk Action Partial Success', `Failed to delete ${failCount} of the selected leads.`);
      }
      setSelectedLeads([]);
      router.refresh();
    }
  };

  // Helper colors for status badges
  const statusBadges: Record<string, string> = {
    'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Interested': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Discovery Call': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Proposal Sent': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Negotiation': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const priorityBadges: Record<string, string> = {
    'High': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Low': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Top Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Lead Profiles</h2>
          <p className="text-xs text-zinc-500">Add, segment, and consult profiles for outreach operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Import capability is mock-enabled. Drag a spreadsheet CSV into this window to parse.')}
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-950/40 hover:shadow-blue-500/10 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar Row */}
      <div className="glass-panel p-4 rounded-xl border border-zinc-900 bg-zinc-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-[50%] -translate-y-[50%] text-zinc-500" size={15} />
          <input
            type="text"
            placeholder="Search clients by name, company, or industry..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-white placeholder-zinc-600 rounded-lg pl-9 pr-4 py-2 outline-none transition-all"
          />
        </div>

        {/* Filters and View toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1.5 rounded-lg border border-zinc-900">
            <Filter size={12} className="text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] text-zinc-300 border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-950">All Statuses</option>
              <option value="New Lead" className="bg-zinc-950">New Lead</option>
              <option value="Contacted" className="bg-zinc-950">Contacted</option>
              <option value="Interested" className="bg-zinc-950">Interested</option>
              <option value="Discovery Call" className="bg-zinc-950">Discovery Call</option>
              <option value="Proposal Sent" className="bg-zinc-950">Proposal Sent</option>
              <option value="Negotiation" className="bg-zinc-950">Negotiation</option>
              <option value="Won" className="bg-zinc-950">Won</option>
              <option value="Lost" className="bg-zinc-950">Lost</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1.5 rounded-lg border border-zinc-900">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] text-zinc-300 border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-950">All Priorities</option>
              <option value="High" className="bg-zinc-950">High</option>
              <option value="Medium" className="bg-zinc-950">Medium</option>
              <option value="Low" className="bg-zinc-950">Low</option>
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-colors ${viewMode === 'table' ? 'bg-zinc-800 text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Table View"
            >
              <Table size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-[50%] -translate-x-[50%] z-30 flex items-center gap-4 px-6 py-3 bg-zinc-950 border border-blue-900/30 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-bold text-zinc-400">
            {selectedLeads.length} Selected
          </span>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Selected</span>
          </button>
          <button
            onClick={() => setSelectedLeads([])}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Leads Main List */}
      {filteredLeads.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-16 rounded-xl border border-zinc-900 bg-zinc-950/5 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-full text-zinc-600 mb-4">
            <Briefcase size={36} />
          </div>
          <h3 className="text-base font-bold text-white">No Leads Registered</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-2">
            Import bulk client data or register your first sales lead manually to initiate the operating flow.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create First Lead</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="glass-panel rounded-xl border border-zinc-900 bg-zinc-950/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-900/10">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === currentItems.length && currentItems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((lead) => (
                  <tr 
                    key={lead._id} 
                    className={`border-b border-zinc-900/50 hover:bg-zinc-900/20 text-xs transition-colors duration-150 ${selectedLeads.includes(lead._id) ? 'bg-blue-600/5' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                        className="rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/leads/${lead._id}`} className="font-semibold text-white hover:text-blue-500 transition-colors block">
                        {lead.name}
                      </Link>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{lead.company}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${statusBadges[lead.status] || ''}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${priorityBadges[lead.priority] || ''}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-medium">
                      {lead.industry || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-300 block font-mono">{lead.email || '—'}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">{lead.phone || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/leads/${lead._id}`}
                          className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500 bg-zinc-950/20">
              <span>
                Showing <strong className="text-white">{indexOfFirstItem + 1}</strong> to{' '}
                <strong className="text-white">
                  {Math.min(indexOfLastItem, filteredLeads.length)}
                </strong>{' '}
                of <strong className="text-white">{filteredLeads.length}</strong> entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-6 h-6 rounded border font-semibold flex items-center justify-center transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-500'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {currentItems.map((lead) => (
            <div 
              key={lead._id}
              className="glass-card p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/leads/${lead._id}`} className="font-semibold text-white hover:text-blue-500 transition-colors block truncate">
                      {lead.name}
                    </Link>
                    <span className="text-[10px] text-zinc-500 truncate block mt-0.5">{lead.company}</span>
                  </div>
                  <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded uppercase shrink-0 ${statusBadges[lead.status] || ''}`}>
                    {lead.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {lead.industry && (
                    <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-900 px-1.5 py-0.5 rounded">
                      {lead.industry}
                    </span>
                  )}
                  <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded uppercase ${priorityBadges[lead.priority] || ''}`}>
                    {lead.priority}
                  </span>
                </div>

                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-4 leading-normal">
                  {lead.notes || 'No notes added for this profile.'}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="font-mono truncate max-w-[120px]">{lead.email || '—'}</span>
                
                <div className="flex items-center gap-1">
                  <Link
                    href={`/leads/${lead._id}`}
                    className="p-1 bg-zinc-950 border border-zinc-900 rounded text-zinc-400 hover:text-white transition-colors"
                  >
                    <Eye size={12} />
                  </Link>
                  <button
                    onClick={() => handleOpenEdit(lead)}
                    className="p-1 bg-zinc-950 border border-zinc-900 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="p-1 bg-zinc-950 border border-zinc-900 rounded text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Over Drawer for Create / Edit Form */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'create' ? 'Create Lead Profile' : 'Edit Lead Profile'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Drawer Tabs */}
          <div className="flex border-b border-zinc-900 pb-px">
            {(['basic', 'contact', 'social', 'business', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-500' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Tabs Content */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="e.g. Tony Stark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="e.g. Stark Industries"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="e.g. Clean Energy"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="SMB">SMB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Discovery Call">Discovery Call</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Contact Person (Title/Name)</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="e.g. Tony Stark (CEO)"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="e.g. tony@starkindustries.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="+1 (555)..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsApp"
                    value={formData.whatsApp}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="Provide if different"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Instagram Profile</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Twitter / X Profile</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">YouTube</label>
                  <input
                    type="url"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="e.g. United States"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                    placeholder="e.g. New York"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none resize-none"
                  placeholder="Outline the client's industry footprint, operations, and core products..."
                />
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="e.g. Enterprise, Tech, High-value"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-lg px-3 py-2 outline-none resize-none"
                  placeholder="Add any specific context, conversational cues, or next action details here..."
                />
              </div>
            </div>
          )}

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-950/40 hover:shadow-blue-500/10 transition-all cursor-pointer"
            >
              {drawerMode === 'create' ? 'Create Profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
