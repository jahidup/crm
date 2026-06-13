import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { AIConversation } from '@/lib/models/AIConversation';
import { askGemini, buildSystemContextPrompt } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { leadId, message } = await request.json();

    if (!leadId || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let conversation = await AIConversation.findOne({ leadId });
    if (!conversation) {
      conversation = new AIConversation({ leadId, messages: [] });
    }

    const systemPrompt = buildSystemContextPrompt(lead);

    let historyContext = 'Conversation history:\n';
    conversation.messages.slice(-8).forEach((msg: any) => {
      historyContext += `${msg.sender === 'user' ? 'USER' : 'AI'}: ${msg.content}\n`;
    });

    const fullPrompt = `${systemPrompt}\n\n${historyContext}\nUSER: ${message}\nAI:`;
    
    const fallbackText = `Advisor: Regarding your query about ${lead.name} (${lead.company}), based on their profile in ${lead.industry || 'general industry'} and current status of "${lead.status}", we recommend scheduling a direct alignment check. Let me know if you would like me to compile specific proposal terms or draft an outreach sequence.`;

    const responseText = await askGemini(fullPrompt, fallbackText);

    conversation.messages.push({
      sender: 'user',
      content: message,
      timestamp: new Date(),
    });

    conversation.messages.push({
      sender: 'ai',
      content: responseText,
      timestamp: new Date(),
    });

    await conversation.save();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Failed to complete chat request' }, { status: 500 });
  }
}
