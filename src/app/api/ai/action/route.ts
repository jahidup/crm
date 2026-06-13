import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { AIConversation } from '@/lib/models/AIConversation';
import { askGemini, buildSystemContextPrompt, getFallbackForAction } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { leadId, action } = await request.json();

    if (!leadId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const systemContext = buildSystemContextPrompt(lead);
    const actionPrompts: Record<string, string> = {
      analyze: `${systemContext}\n\nPerform a complete business analysis for ${lead.company}. Identify strategic bottlenecks and our ideal value proposition pitch.`,
      strategy: `${systemContext}\n\nGenerate a detailed personalized sales strategy roadmap to convert ${lead.name}.`,
      outreach: `${systemContext}\n\nDraft three personalized outreach templates: one WhatsApp, one LinkedIn, and one email for ${lead.name}.`,
      proposal: `${systemContext}\n\nDraft a complete formal sales proposal frame for ${lead.company}, including commercial scope and implementation timeline.`,
      budget: `${systemContext}\n\nEstimate the project budget potential for ${lead.company} based on their scale. Detail optimal pricing and potential upsells.`,
      meeting: `${systemContext}\n\nPrepare a meeting agenda, discovery questions, and objection handling guidelines for the upcoming call with ${lead.name}.`,
      score: `${systemContext}\n\nProvide a detailed lead score from 0 to 100 with a breakdown of fit, engagement, and urgency.`,
    };

    const prompt = actionPrompts[action] || `${systemContext}\n\nReview this profile.`;
    const fallbackText = getFallbackForAction(action, lead);

    const resultText = await askGemini(prompt, fallbackText);

    // Save to conversation history
    let conversation = await AIConversation.findOne({ leadId });
    if (!conversation) {
      conversation = new AIConversation({ leadId, messages: [] });
    }

    const actionNames: Record<string, string> = {
      analyze: 'Analyze Business Request',
      strategy: 'Generate Strategy Request',
      outreach: 'Create Outreach Request',
      proposal: 'Generate Proposal Request',
      budget: 'Estimate Budget Request',
      meeting: 'Meeting Preparation Request',
      score: 'Lead Score Request',
    };

    conversation.messages.push({
      sender: 'user',
      content: `[Quick Action Triggered]: ${actionNames[action] || action}`,
      timestamp: new Date(),
    });

    conversation.messages.push({
      sender: 'ai',
      content: resultText,
      timestamp: new Date(),
    });

    await conversation.save();

    return NextResponse.json({ text: resultText });
  } catch (error: any) {
    console.error('AI Action error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}
