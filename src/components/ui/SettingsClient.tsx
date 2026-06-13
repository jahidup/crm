'use client';

import React, { useState } from 'react';
import { saveSettings } from '@/lib/actions/settings';
import { toast } from '@/components/ui/Toast';
import { Settings, ShieldCheck, Mail, Phone, MapPin, Building, Key } from 'lucide-react';

interface SettingsClientProps {
  initialSettings: any;
  geminiStatus: string;
}

export default function SettingsClient({ initialSettings, geminiStatus }: SettingsClientProps) {
  const [companyName, setCompanyName] = useState(initialSettings.companyName || '');
  const [companyEmail, setCompanyEmail] = useState(initialSettings.companyEmail || '');
  const [companyPhone, setCompanyPhone] = useState(initialSettings.companyPhone || '');
  const [companyAddress, setCompanyAddress] = useState(initialSettings.companyAddress || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const res = await saveSettings({
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
    });

    if (res.success) {
      toast.success('Settings Saved', 'Global company settings updated.');
    } else {
      toast.error('Failed to save settings', res.error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-zinc-500">Configure corporate settings, email targets, and API integrations.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5 tracking-wider">Company Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Building size={14} />
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 outline-none"
                placeholder="e.g. NexGenAiTech"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5 tracking-wider">Corporate Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 outline-none"
                  placeholder="contact@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5 tracking-wider">Corporate Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Phone size={14} />
                </div>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 outline-none"
                  placeholder="+1 (555)..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5 tracking-wider">Corporate HQ Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <MapPin size={14} />
              </div>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 outline-none"
                placeholder="100 Silicon Valley, San Jose, CA"
              />
            </div>
          </div>

          {/* Gemini API Key Status Check */}
          <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-blue-500" />
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Gemini AI Integration Status</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-500">Core API Connection Status:</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                geminiStatus === 'Active'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                  : 'bg-yellow-950/40 text-yellow-500 border-yellow-900/30'
              }`}>
                {geminiStatus}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal pt-1">
              The AI Advisor relies on the <code className="text-blue-400 bg-zinc-900 px-1 py-0.5 rounded">GEMINI_API_KEY</code> environment variable. If missing, high-fidelity mock calculations are deployed.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-900 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
