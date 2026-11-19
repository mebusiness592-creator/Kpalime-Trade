import { Types } from 'mongoose';
import { Product } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { Accommodation } from '@/models/Accommodation';
import { Restaurant } from '@/models/Restaurant';
import { Professional } from '@/models/Professional';
import { TouristSite } from '@/models/TouristSite';
import type { TARGET_TYPES } from '@/models/Inquiry';

export interface ResolvedTarget { name: string; slug?: string; recipientId: Types.ObjectId }

/** Retrouve côté serveur le destinataire réel d'une fiche (jamais fourni par le client). */
export async function resolveTarget(type: (typeof TARGET_TYPES)[number], id: string): Promise<ResolvedTarget | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let d: any = null;
  switch (type) {
    case 'product': {
      d = await Product.findById(id).lean();
      if (!d) return null;
      const shop = await Shop.findById(d.shopId).select('ownerId').lean();
      return shop ? { name: d.name, slug: d.slug, recipientId: shop.ownerId } : null;
    }
    case 'shop': d = await Shop.findById(id).lean(); return d ? { name: d.name, slug: d.slug, recipientId: d.ownerId } : null;
    case 'hotel': d = await Accommodation.findById(id).lean(); return d?.ownerId ? { name: d.name, slug: d.slug, recipientId: d.ownerId } : null;
    case 'restaurant': d = await Restaurant.findById(id).lean(); return d?.ownerId ? { name: d.name, slug: d.slug, recipientId: d.ownerId } : null;
    case 'service': d = await Professional.findById(id).lean(); return d?.ownerId ? { name: d.name, slug: d.slug, recipientId: d.ownerId } : null;
    case 'tourism': d = await TouristSite.findById(id).lean(); return d?.ownerId ? { name: d.name, slug: d.slug, recipientId: d.ownerId } : null;
  }
}
