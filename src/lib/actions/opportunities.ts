'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/lib/models/Opportunity';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';

export async function createOpportunity(data: any, userId?: string) {
  try {
    await connectToDatabase();

    const opportunity = await Opportunity.create({
      leadId: data.leadId,
      serviceOffered: data.serviceOffered,
      estimatedBudget: Number(data.estimatedBudget),
      probability: Number(data.probability || 50),
      expectedClosingDate: data.expectedClosingDate,
      pipelineStage: data.pipelineStage || 'Prospect',
    });

    // Log activity
    await Activity.create({
      leadId: data.leadId,
      type: 'opportunity_created',
      description: `New Opportunity created: "${data.serviceOffered}" - Est Budget: ₹${data.estimatedBudget}`,
      userId: userId || null,
    });

    revalidatePath('/');
    revalidatePath('/opportunities');
    revalidatePath(`/leads/${data.leadId}`);
    return { success: true, oppId: opportunity._id.toString() };
  } catch (error: any) {
    console.error('Error creating opportunity:', error);
    return { success: false, error: error.message || 'Failed to create opportunity' };
  }
}

export async function updateOpportunityStage(oppId: string, stage: string, userId?: string) {
  try {
    await connectToDatabase();

    const opp = await Opportunity.findById(oppId).populate('leadId');
    if (!opp) return { success: false, error: 'Opportunity not found' };

    const oldStage = opp.pipelineStage;
    if (oldStage === stage) return { success: true };

    opp.pipelineStage = stage;
    if (stage === 'Won') {
      opp.finalBudget = opp.estimatedBudget;
      opp.probability = 100;
    } else if (stage === 'Lost') {
      opp.probability = 0;
    }
    await opp.save();

    // Log Activity based on transition
    let type: any = 'general';
    let desc = `Opportunity "${opp.serviceOffered}" stage changed from "${oldStage}" to "${stage}"`;

    if (stage === 'Won') {
      type = 'opportunity_won';
      desc = `Deal Secured! Opportunity "${opp.serviceOffered}" for ${opp.leadId?.name} won. Value: ₹${opp.estimatedBudget}`;
      
      // Update the Lead status to Won as well!
      if (opp.leadId) {
        const lead = await Lead.findById(opp.leadId._id);
        if (lead) {
          lead.status = 'Won';
          await lead.save();
        }
      }
    } else if (stage === 'Lost') {
      type = 'opportunity_lost';
      desc = `Deal Lost: Opportunity "${opp.serviceOffered}" for ${opp.leadId?.name} marked Lost.`;
      
      if (opp.leadId) {
        const lead = await Lead.findById(opp.leadId._id);
        if (lead) {
          lead.status = 'Lost';
          await lead.save();
        }
      }
    } else {
      // General transition updates lead status to match
      const leadStatusMap: Record<string, string> = {
        Prospect: 'Interested',
        Qualified: 'Discovery Call',
        Proposal: 'Proposal Sent',
        Negotiation: 'Negotiation',
      };
      if (opp.leadId && leadStatusMap[stage]) {
        const lead = await Lead.findById(opp.leadId._id);
        if (lead) {
          lead.status = leadStatusMap[stage];
          await lead.save();
        }
      }
    }

    await Activity.create({
      leadId: opp.leadId?._id,
      type,
      description: desc,
      userId: userId || null,
    });

    revalidatePath('/');
    revalidatePath('/opportunities');
    if (opp.leadId) revalidatePath(`/leads/${opp.leadId._id}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating opportunity stage:', error);
    return { success: false, error: error.message || 'Failed to update opportunity' };
  }
}
