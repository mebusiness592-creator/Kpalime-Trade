import mongoose, { Schema, Model } from 'mongoose';

/** Diapositive de la bannière d'accueil : image en arrière-plan, texte par-dessus. */
export interface IHeroSlide {
  _id: mongoose.Types.ObjectId;
  imageUrl: string;
  imagePublicId?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  cta2Label?: string;
  cta2Href?: string;
  overlay: number; // 0-90 : opacité du voile sombre
  align: 'left' | 'center';
  order: number;
  isActive: boolean;
}

const schema = new Schema<IHeroSlide>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    eyebrow: { type: String, maxlength: 80 },
    title: { type: String, required: true, maxlength: 140 },
    subtitle: { type: String, maxlength: 320 },
    ctaLabel: { type: String, maxlength: 40 },
    ctaHref: { type: String, maxlength: 200 },
    cta2Label: { type: String, maxlength: 40 },
    cta2Href: { type: String, maxlength: 200 },
    overlay: { type: Number, default: 55, min: 0, max: 90 },
    align: { type: String, enum: ['left', 'center'], default: 'left' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
schema.index({ isActive: 1, order: 1 });

export const HeroSlide: Model<IHeroSlide> = mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', schema);
