import mongoose, { Schema, Model } from 'mongoose';

/** Paramètres uniques du site (identité, thème, contacts) modifiables depuis l'admin. */
const schema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const SiteConfig: Model<{ key: string; data: Record<string, unknown> }> =
  mongoose.models.SiteConfig || mongoose.model('SiteConfig', schema);
