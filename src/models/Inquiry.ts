import mongoose, { Schema, Model } from 'mongoose';

export const INQUIRY_KINDS = ['info', 'quote', 'reservation'] as const;
export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'closed'] as const;
export const TARGET_TYPES = ['product', 'shop', 'hotel', 'restaurant', 'service', 'tourism'] as const;

export interface IInquiry {
  _id: mongoose.Types.ObjectId;
  reference: string;
  kind: (typeof INQUIRY_KINDS)[number];
  targetType: (typeof TARGET_TYPES)[number];
  targetId: mongoose.Types.ObjectId;
  targetName: string;
  targetSlug?: string;
  recipientId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  details?: { quantity?: string; checkIn?: string; checkOut?: string; guests?: number; budget?: string };
  status: (typeof INQUIRY_STATUSES)[number];
  replies: { authorId: mongoose.Types.ObjectId; fromRecipient: boolean; body: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IInquiry>(
  {
    reference: { type: String, required: true, unique: true },
    kind: { type: String, enum: INQUIRY_KINDS, default: 'info' },
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetName: { type: String, required: true },
    targetSlug: { type: String },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, maxlength: 200 },
    phone: { type: String, maxlength: 40 },
    message: { type: String, required: true, maxlength: 4000 },
    details: { type: Schema.Types.Mixed },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new' },
    replies: [{
      authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      fromRecipient: { type: Boolean, required: true },
      body: { type: String, required: true, maxlength: 4000 },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);
schema.index({ createdAt: -1 });

export const Inquiry: Model<IInquiry> = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', schema);
