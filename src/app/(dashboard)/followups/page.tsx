import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Followup } from '@/lib/models/Followup';
import { Lead } from '@/lib/models/Lead';
import FollowUpsClient from './FollowUpsClient';

export default async function FollowupsPage() {
  await connectToDatabase();

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

  // Find and update overdue tasks
  const upcomingFups = await Followup.find({ status: 'Upcoming' });
  for (const fup of upcomingFups) {
    if (fup.date < dateStr || (fup.date === dateStr && fup.time < timeStr)) {
      fup.status = 'Overdue';
      await fup.save();
    }
  }

  // Fetch all followups
  const followups = await Followup.find({})
    .populate('leadId', 'name company')
    .sort({ date: 1, time: 1 })
    .lean();

  // Fetch all leads for schedule form selector
  const leads = await Lead.find({}, 'name company')
    .sort({ name: 1 })
    .lean();

  const serializedFollowups = JSON.parse(JSON.stringify(followups));
  const serializedLeads = JSON.parse(JSON.stringify(leads));

  return (
    <FollowUpsClient
      followups={serializedFollowups}
      leads={serializedLeads}
    />
  );
}
