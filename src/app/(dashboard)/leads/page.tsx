import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import LeadsListClient from './LeadsListClient';

export default async function LeadsPage() {
  await connectToDatabase();
  
  const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize Mongo _id and date elements to satisfy SSR constraints
  const serializedLeads = JSON.parse(JSON.stringify(leads));

  return <LeadsListClient initialLeads={serializedLeads} />;
}
