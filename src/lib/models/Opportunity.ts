import mongoose, { Schema, model, models } from 'mongoose';

const OpportunitySchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  serviceOffered: { type: String, required: true },
  estimatedBudget: { type: Number, required: true },
  finalBudget: { type: Number, default: 0 },
  probability: { type: Number, min: 0, max: 100, default: 50 },
  expectedClosingDate: { type: String, required: true }, // YYYY-MM-DD
  pipelineStage: {
    type: String,
    enum: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    default: 'Prospect',
  },
}, { timestamps: true });

export const Opportunity = models.Opportunity || model('Opportunity', OpportunitySchema);
export default Opportunity;
