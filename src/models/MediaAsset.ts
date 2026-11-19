import mongoose, { Schema, Model } from 'mongoose';

export interface IMediaAsset {
  _id: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  folder: string;
  label?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const schema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    folder: { type: String, default: 'general' },
    label: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
schema.index({ createdAt: -1 });

export const MediaAsset: Model<IMediaAsset> = mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', schema);
