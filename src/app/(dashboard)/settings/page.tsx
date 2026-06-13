import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Settings } from '@/lib/models/Settings';
import SettingsClient from '@/components/ui/SettingsClient';

export default async function SettingsPage() {
  await connectToDatabase();
  
  let settings = await Settings.findOne({}).lean();
  if (!settings) {
    settings = {
      companyName: 'NexGenAiTech',
      companyEmail: 'contact@nexgenaitech.com',
      companyPhone: '+1 (555) 019-2834',
      companyAddress: 'Silicon Valley, California',
    };
  }

  const geminiStatus = process.env.GEMINI_API_KEY ? 'Active' : 'Offline fallback active';

  return (
    <SettingsClient
      initialSettings={JSON.parse(JSON.stringify(settings))}
      geminiStatus={geminiStatus}
    />
  );
}
