import mongoose, { Schema, Model } from 'mongoose';

/** Catégories et types gérés depuis l'admin : boutiques, services, tourisme, cuisines, événements... */
export const TAXONOMY_KINDS = [
  { value: 'shop', label: 'Type de boutique' },
  { value: 'service', label: 'Catégorie de service / entreprise' },
  { value: 'tourism', label: 'Catégorie de site touristique' },
  { value: 'restaurant', label: 'Type de cuisine (restaurant)' },
  { value: 'event', label: 'Type d’événement' },
  { value: 'culture', label: 'Rubrique culture' },
] as const;

export interface ITaxonomy {
  _id: mongoose.Types.ObjectId;
  kind: string; name: string; slug: string; description?: string; image?: string;
  keywords: string[]; position: number; isActive: boolean;
}

const schema = new Schema<ITaxonomy>(
  {
    kind: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true },
    description: { type: String, maxlength: 600 },
    image: { type: String },
    keywords: { type: [String], default: [] },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
schema.index({ kind: 1, slug: 1 }, { unique: true });

export const Taxonomy: Model<ITaxonomy> = mongoose.models.Taxonomy || mongoose.model<ITaxonomy>('Taxonomy', schema);
