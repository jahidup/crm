'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';

export async function createLead(data: any, userId?: string) {
  try {
    await connectToDatabase();
    
    // Construct lead data
    const leadData = {
      name: data.name,
      company: data.company,
      industry: data.industry || '',
      category: data.category || 'SMB',
      website: data.website || '',
      contactPerson: data.contactPerson || '',
      email: data.email || '',
      phone: data.phone || '',
      whatsApp: data.whatsApp || '',
      socials: {
        linkedIn: data.linkedIn || '',
        instagram: data.instagram || '',
        facebook: data.facebook || '',
        twitter: data.twitter || '',
        youtube: data.youtube || '',
      },
      business: {
        country: data.country || '',
        city: data.city || '',
        description: data.description || '',
      },
      status: data.status || 'New Lead',
      priority: data.priority || 'Medium',
      notes: data.notes || '',
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      assignedTo: userId || null,
    };

    const lead = await Lead.create(leadData);

    // Save activity
    await Activity.create({
      leadId: lead._id,
      type: 'lead_created',
      description: `Lead created for ${lead.name} (${lead.company})`,
      userId: userId || null,
    });

    revalidatePath('/');
    revalidatePath('/leads');
    return { success: true, leadId: lead._id.toString() };
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message || 'Failed to create lead' };
  }
}

export async function updateLead(leadId: string, data: any, userId?: string) {
  try {
    await connectToDatabase();

    const existingLead = await Lead.findById(leadId);
    if (!existingLead) {
      return { success: false, error: 'Lead not found' };
    }

    const oldStatus = existingLead.status;
    const newStatus = data.status || existingLead.status;

    // Update fields
    existingLead.name = data.name ?? existingLead.name;
    existingLead.company = data.company ?? existingLead.company;
    existingLead.industry = data.industry ?? existingLead.industry;
    existingLead.category = data.category ?? existingLead.category;
    existingLead.website = data.website ?? existingLead.website;
    existingLead.contactPerson = data.contactPerson ?? existingLead.contactPerson;
    existingLead.email = data.email ?? existingLead.email;
    existingLead.phone = data.phone ?? existingLead.phone;
    existingLead.whatsApp = data.whatsApp ?? existingLead.whatsApp;
    
    if (data.socials) {
      existingLead.socials = {
        linkedIn: data.socials.linkedIn ?? existingLead.socials.linkedIn,
        instagram: data.socials.instagram ?? existingLead.socials.instagram,
        facebook: data.socials.facebook ?? existingLead.socials.facebook,
        twitter: data.socials.twitter ?? existingLead.socials.twitter,
        youtube: data.socials.youtube ?? existingLead.socials.youtube,
      };
    }
    
    if (data.business) {
      existingLead.business = {
        country: data.business.country ?? existingLead.business.country,
        city: data.business.city ?? existingLead.business.city,
        description: data.business.description ?? existingLead.business.description,
      };
    }

    existingLead.status = newStatus;
    existingLead.priority = data.priority ?? existingLead.priority;
    existingLead.notes = data.notes ?? existingLead.notes;
    
    if (typeof data.tags === 'string') {
      existingLead.tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    await existingLead.save();

    // Log Activity
    if (oldStatus !== newStatus) {
      await Activity.create({
        leadId: existingLead._id,
        type: 'status_changed',
        description: `Lead status for ${existingLead.name} changed from "${oldStatus}" to "${newStatus}"`,
        userId: userId || null,
      });
    } else {
      await Activity.create({
        leadId: existingLead._id,
        type: 'lead_updated',
        description: `Lead information updated for ${existingLead.name}`,
        userId: userId || null,
      });
    }

    revalidatePath('/');
    revalidatePath('/leads');
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message || 'Failed to update lead' };
  }
}

export async function deleteLead(leadId: string, userId?: string) {
  try {
    await connectToDatabase();
    
    const lead = await Lead.findByIdAndDelete(leadId);
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // Log activity
    await Activity.create({
      type: 'general',
      description: `Lead for ${lead.name} (${lead.company}) was deleted`,
      userId: userId || null,
    });

    revalidatePath('/');
    revalidatePath('/leads');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return { success: false, error: error.message || 'Failed to delete lead' };
  }
}
