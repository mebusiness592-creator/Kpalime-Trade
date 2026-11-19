import mongoose, { Schema, Model } from 'mongoose';

export const TICKET_SUBJECTS = [
  'account', 'publication', 'validation', 'edit_listing', 'commercial', 'technical', 'complaint', 'other',
] as const;
export const TICKET_STATUSES = ['new', 'awaiting_admin', 'in_progress', 'awaiting_user', 'resolved', 'closed'] as const;

export interface ITicketMessage {
  authorId: mongoose.Types.ObjectId;
  authorRole: 'user' | 'admin';
  body: string;
  attachments: string[];
  createdAt: Date;
}

export interface ISupportTicket {
  _id: mongoose.Types.ObjectId;
  reference: string;
  userId: mongoose.Types.ObjectId;
  subject: (typeof TICKET_SUBJECTS)[number];
  title: string;
  status: (typeof TICKET_STATUSES)[number];
  assignedTo?: mongoose.Types.ObjectId;
  relatedModel?: string;
  relatedId?: string;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<ITicketMessage>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorRole: { type: String, enum: ['user', 'admin'], required: true },
    body: { type: String, required: true, maxlength: 5000 },
    attachments: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const schema = new Schema<ISupportTicket>(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, enum: TICKET_SUBJECTS, default: 'other' },
    title: { type: String, required: true, maxlength: 200 },
    status: { type: String, enum: TICKET_STATUSES, default: 'new' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    relatedModel: { type: String },
    relatedId: { type: String },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);
schema.index({ userId: 1, updatedAt: -1 });
schema.index({ status: 1, updatedAt: -1 });

export const SupportTicket: Model<ISupportTicket> = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', schema);
