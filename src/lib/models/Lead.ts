import mongoose, { Schema, model, models } from 'mongoose';

const LeadSchema = new Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  industry: { type: String },
  category: { type: String },
  website: { type: String },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsApp: { type: String },
  socials: {
    linkedIn: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  business: {
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['New Lead', 'Contacted', 'Interested', 'Discovery Call', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
    default: 'New Lead',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Lead = models.Lead || model('Lead', LeadSchema);
export default Lead;
