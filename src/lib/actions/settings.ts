'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { Settings } from '@/lib/models/Settings';

export async function saveSettings(data: any) {
  try {
    await connectToDatabase();
    
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
    }

    settings.companyName = data.companyName;
    settings.companyEmail = data.companyEmail;
    settings.companyPhone = data.companyPhone;
    settings.companyAddress = data.companyAddress;

    await settings.save();
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message || 'Failed to save settings' };
  }
}
