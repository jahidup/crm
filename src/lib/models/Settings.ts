import mongoose, { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema({
  companyName: { type: String, default: 'NexGenAiTech' },
  companyEmail: { type: String, default: 'contact@nexgenaitech.com' },
  companyPhone: { type: String, default: '+1 (555) 019-2834' },
  companyAddress: { type: String, default: 'Silicon Valley, California' },
}, { timestamps: true });

export const Settings = models.Settings || model('Settings', SettingsSchema);
export default Settings;
