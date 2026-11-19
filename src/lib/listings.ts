import { Restaurant } from '@/models/Restaurant';
import { Professional } from '@/models/Professional';
import { TouristSite } from '@/models/TouristSite';
import { LISTING_CONFIG, type ListingType, type FieldDef } from '@/lib/listing-config';
import { isOwnCloudinaryUrl } from '@/lib/cloudinary-sign';
import type { Model } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LISTING_MODELS: Record<ListingType, Model<any>> = { restaurant: Restaurant, service: Professional, tourism: TouristSite };

export function isListingType(t: string): t is ListingType { return t in LISTING_CONFIG; }

export function slugify(s: string, suffix = true) {
  const base = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'fiche';
  return suffix ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
}

const img = (v: unknown) => {
  const o = v as { secure_url?: string; public_id?: string } | null;
  return o && isOwnCloudinaryUrl(o.secure_url) ? { secure_url: o.secure_url, public_id: String(o.public_id || '') } : null;
};

/** Ne garde que les champs autorisés, convertis au bon type. Renvoie une erreur lisible si un champ requis manque. */
export function sanitizeListing(type: ListingType, body: Record<string, unknown>, partial = false) {
  return sanitizeFields(LISTING_CONFIG[type].fields, body, partial);
}

export function sanitizeFields(fields: FieldDef[], body: Record<string, unknown>, partial = false): { data?: Record<string, unknown>; error?: string } {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = body[f.name];
    if (raw === undefined) { if (f.required && !partial) return { error: `${f.label} est obligatoire` }; continue; }
    switch (f.type) {
      case 'text': case 'textarea': case 'email': case 'select': {
        const v = String(raw ?? '').trim().slice(0, f.type === 'textarea' ? 5000 : 300);
        if (f.required && !v) return { error: `${f.label} est obligatoire` };
        if (f.type === 'select' && v && f.options && !f.options.some((o) => o.value === v)) return { error: `${f.label} : valeur invalide` };
        if (f.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) return { error: 'E-mail invalide' };
        out[f.name] = v || undefined; break;
      }
      case 'number': {
        if (raw === '' || raw === null) { out[f.name] = undefined; break; }
        const n = Number(raw); if (Number.isNaN(n)) return { error: `${f.label} doit être un nombre` };
        out[f.name] = n; break;
      }
      case 'boolean': out[f.name] = raw === true || raw === 'true'; break;
      case 'date': { if (!raw) { out[f.name] = undefined; break; } const d = new Date(String(raw)); if (Number.isNaN(d.getTime())) return { error: `${f.label} : date invalide` }; out[f.name] = d; break; }
      case 'tags': out[f.name] = (Array.isArray(raw) ? raw : String(raw).split(',')).map((t) => String(t).trim()).filter(Boolean).slice(0, 30); break;
      case 'image': out[f.name] = raw ? (isOwnCloudinaryUrl(raw) ? raw : undefined) : undefined; break;
      case 'gallery': out[f.name] = (Array.isArray(raw) ? raw : []).map(img).filter(Boolean).slice(0, 20); break;
    }
  }
  return { data: out };
}
