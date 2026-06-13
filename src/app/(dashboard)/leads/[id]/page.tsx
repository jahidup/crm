import React from 'react';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { Followup } from '@/lib/models/Followup';
import { AIConversation } from '@/lib/models/AIConversation';
import LeadDetailsClient from './LeadDetailsClient';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  await connectToDatabase();

  const lead = await Lead.findById(id).lean();
  if (!lead) {
    notFound();
  }

  // Fetch activities
  const activities = await Activity.find({ leadId: id })
    .sort({ createdAt: -1 })
    .lean();

  // Fetch followups
  const followups = await Followup.find({ leadId: id })
    .sort({ date: 1, time: 1 })
    .lean();

  // Fetch advisor chat history
  const conversation = await AIConversation.findOne({ leadId: id }).lean();
  const chatMessages = conversation?.messages || [
    {
      sender: 'ai',
      content: `### Welcome to AI Advisor Panel
Select any of the quick actions below to kickstart sales strategies for **${lead.company}**. 

Ask me any specific competitor profiling, objection handling, or customized WhatsApp copy questions directly in the input field.`,
      timestamp: new Date().toISOString(),
    }
  ];

  // Serialize models for SSR hydration safety
  const serializedLead = JSON.parse(JSON.stringify(lead));
  const serializedActivities = JSON.parse(JSON.stringify(activities));
  const serializedFollowups = JSON.parse(JSON.stringify(followups));
  const serializedChatMessages = JSON.parse(JSON.stringify(chatMessages));

  return (
    <LeadDetailsClient
      lead={serializedLead}
      activities={serializedActivities}
      followups={serializedFollowups}
      initialChatHistory={serializedChatMessages}
    />
  );
}
