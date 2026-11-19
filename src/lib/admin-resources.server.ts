import type { Model } from 'mongoose';
import { User } from '@/models/User';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Order } from '@/models/Order';
import { Currency } from '@/models/Currency';
import { Event } from '@/models/Event';
import { CulturalArticle } from '@/models/CulturalArticle';
import { Artisan } from '@/models/Artisan';
import { Guide } from '@/models/Guide';
import { Review } from '@/models/Review';
import { Report } from '@/models/Report';
import { Accommodation } from '@/models/Accommodation';
import { Restaurant } from '@/models/Restaurant';
import { Professional } from '@/models/Professional';
import { TouristSite } from '@/models/TouristSite';
import { ContactMessage } from '@/models/ContactMessage';
import { HeroSlide } from '@/models/HeroSlide';
import { ADMIN_RESOURCES, type ResourceCfg } from '@/lib/admin-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = Model<any>;

export const RESOURCE_MODELS: Record<string, AnyModel> = {
  users: User, shops: Shop, products: Product, categories: Category, orders: Order, currencies: Currency, events: Event,
  culture: CulturalArticle, artisans: Artisan, guides: Guide, reviews: Review, reports: Report, hotels: Accommodation,
  restaurants: Restaurant, services: Professional, tourism: TouristSite, banners: HeroSlide, contact: ContactMessage,
};

export const RESOURCE_POPULATE: Record<string, { path: string; select: string }[]> = {
  shops: [{ path: 'ownerId', select: 'name email' }],
  products: [{ path: 'shopId', select: 'name' }, { path: 'categoryId', select: 'name' }],
  orders: [{ path: 'userId', select: 'name email' }],
  reviews: [{ path: 'userId', select: 'name' }],
  reports: [{ path: 'reporterId', select: 'name' }],
  restaurants: [{ path: 'ownerId', select: 'name email' }],
  services: [{ path: 'ownerId', select: 'name email' }],
  tourism: [{ path: 'ownerId', select: 'name email' }],
};

export function getResource(key: string): { cfg: ResourceCfg; model: AnyModel } | null {
  const cfg = ADMIN_RESOURCES[key];
  const model = RESOURCE_MODELS[key];
  return cfg && model ? { cfg, model } : null;
}

/** Destinataire de la notification pour une fiche donnée. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recipientOf(resource: string, doc: any): Promise<string | null> {
  switch (resource) {
    case 'users': return String(doc._id);
    case 'orders': return doc.userId ? String(doc.userId) : null;
    case 'products': { const s = await Shop.findById(doc.shopId).select('ownerId').lean(); return s ? String(s.ownerId) : null; }
    default: return doc.ownerId ? String(doc.ownerId) : null;
  }
}

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
