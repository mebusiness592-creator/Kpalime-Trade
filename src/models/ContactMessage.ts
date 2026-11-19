import mongoose, { Schema, Model } from 'mongoose';

export interface IContactMessage { _id: mongoose.Types.ObjectId; name: string; email: string; phone?: string; subject: string; message: string; status: 'new' | 'read' | 'done' }

const schema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, maxlength: 40 },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 4000 },
    status: { type: String, enum: ['new', 'read', 'done'], default: 'new' },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessage> = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', schema);
