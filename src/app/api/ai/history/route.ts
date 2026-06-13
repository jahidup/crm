import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { AIConversation } from '@/lib/models/AIConversation';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId parameter' }, { status: 400 });
    }

    const conversation = await AIConversation.findOne({ leadId }).lean();
    return NextResponse.json(conversation?.messages || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversation history' }, { status: 500 });
  }
}
