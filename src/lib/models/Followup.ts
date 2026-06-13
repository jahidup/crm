import mongoose, { Schema, model, models } from 'mongoose';

const FollowupSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  type: {
    type: String,
    enum: ['Call', 'WhatsApp', 'Email', 'Meeting', 'Notes'],
    required: true,
  },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Overdue'],
    default: 'Upcoming',
  },
}, { timestamps: true });

export const Followup = models.Followup || model('Followup', FollowupSchema);
export default Followup;
