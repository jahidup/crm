import mongoose, { Schema, model, models } from 'mongoose';

const ActivitySchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
  type: {
    type: String,
    enum: ['lead_created', 'lead_updated', 'status_changed', 'followup_added', 'opportunity_created', 'opportunity_won', 'opportunity_lost', 'general'],
    default: 'general',
  },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Activity = models.Activity || model('Activity', ActivitySchema);
export default Activity;
