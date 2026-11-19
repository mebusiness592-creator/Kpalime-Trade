import mongoose, { Schema, Model } from 'mongoose';

/** Un emplacement d'image du site (bannière, galerie, carte de région...) modifiable depuis l'admin. */
export interface ISiteImage {
  _id: mongoose.Types.ObjectId;
  key: string;
  url: string;
  alt?: string;
  publicId?: string;
  custom?: boolean;
  label?: string;
  group?: string;
}

const schema = new Schema<ISiteImage>(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    alt: { type: String },
    publicId: { type: String },
    custom: { type: Boolean, default: false },
    label: { type: String },
    group: { type: String },
  },
  { timestamps: true }
);

export const SiteImage: Model<ISiteImage> = mongoose.models.SiteImage || mongoose.model<ISiteImage>('SiteImage', schema);
