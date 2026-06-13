import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';

export async function GET() {
  try {
    await connectToDatabase();
    // Fetch top leads for quick Command Palette access
    const leads = await Lead.find({}, 'name company status').limit(50).lean();
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch search index' }, { status: 500 });
  }
}
