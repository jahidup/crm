import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/lib/models/Opportunity';
import { Lead } from '@/lib/models/Lead';
import OpportunitiesClient from './OpportunitiesClient';

export default async function OpportunitiesPage() {
  await connectToDatabase();

  // Fetch all opportunities populated with lead info
  const opportunities = await Opportunity.find({})
    .populate('leadId', 'name company status')
    .lean();

  // Fetch all leads for adding pipeline cards
  const leads = await Lead.find({}, 'name company')
    .sort({ name: 1 })
    .lean();

  const serializedOpps = JSON.parse(JSON.stringify(opportunities));
  const serializedLeads = JSON.parse(JSON.stringify(leads));

  return (
    <OpportunitiesClient
      opportunities={serializedOpps}
      leads={serializedLeads}
    />
  );
}
