import mongoose, { Schema, Model } from 'mongoose';

export interface IFavorite { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId; targetType: string; targetId: string; name: string; path: string; image?: string }

const schema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    name: { type: String, required: true, maxlength: 200 },
    path: { type: String, required: true, maxlength: 300 },
    image: { type: String },
  },
  { timestamps: true }
);
schema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Favorite: Model<IFavorite> = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', schema);
