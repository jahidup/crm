import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import AIAssistantClient from './AIAssistantClient';

export default async function AIAssistantPage() {
  await connectToDatabase();

  // Fetch all leads for AI context selection
  const leads = await Lead.find({})
    .sort({ name: 1 })
    .lean();

  const serializedLeads = JSON.parse(JSON.stringify(leads));

  return <AIAssistantClient leads={serializedLeads} />;
}
