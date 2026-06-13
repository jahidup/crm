import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AIConversationSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
  messages: [MessageSchema],
}, { timestamps: true });

export const AIConversation = models.AIConversation || model('AIConversation', AIConversationSchema);
export default AIConversation;
