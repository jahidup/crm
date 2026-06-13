'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { Followup } from '@/lib/models/Followup';
import { Activity } from '@/lib/models/Activity';

export async function createFollowup(data: any, userId?: string) {
  try {
    await connectToDatabase();

    const followup = await Followup.create({
      leadId: data.leadId,
      date: data.date,
      time: data.time,
      type: data.type,
      notes: data.notes || '',
      status: 'Upcoming',
    });

    // Save activity
    await Activity.create({
      leadId: data.leadId,
      type: 'followup_added',
      description: `New follow-up ${data.type} scheduled for ${data.date} at ${data.time}`,
      userId: userId || null,
    });

    revalidatePath('/');
    revalidatePath('/followups');
    revalidatePath(`/leads/${data.leadId}`);
    return { success: true, followupId: followup._id.toString() };
  } catch (error: any) {
    console.error('Error creating followup:', error);
    return { success: false, error: error.message || 'Failed to create followup' };
  }
}

export async function updateFollowupStatus(followupId: string, status: string, leadId: string) {
  try {
    await connectToDatabase();

    const fup = await Followup.findById(followupId);
    if (!fup) return { success: false, error: 'Followup not found' };

    fup.status = status;
    await fup.save();

    revalidatePath('/');
    revalidatePath('/followups');
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating followup status:', error);
    return { success: false, error: error.message || 'Failed to update followup' };
  }
}
