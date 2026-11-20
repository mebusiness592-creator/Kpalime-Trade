import { Product } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { escapeRegex } from '@/lib/admin-resources.server';

export const PAGE_SIZE = 12;

export async function pageParams(sp: Promise<Record<string, string | string[] | undefined>>) {
  const o = await sp;
  const one = (k: string) => (Array.isArray(o[k]) ? o[k]![0] : (o[k] as string | undefined)) || '';
  return { q: one('q').trim().slice(0, 80), category: one('category').trim().slice(0, 60), sort: one('sort'), page: Math.max(1, Number(one('page')) || 1) };
}

export const regex = (q: string) => ({ $regex: escapeRegex(q), $options: 'i' });

/**
 * Type de boutique détecté AUTOMATIQUEMENT : la catégorie qui revient le plus
 * dans les produits publiés de la boutique (à défaut, l'activité principale déclarée).
 */
export async function shopCategoryMap(): Promise<Map<string, string>> {
  const rows: { _id: { s: string; c: string }; n: number }[] = await Product.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: { s: '$shopId', c: '$categoryId' }, n: { $sum: 1 } } },
  ]);
  const best = new Map<string, { c: string; n: number }>();
  for (const r of rows) {
    const s = String(r._id.s);
    const cur = best.get(s);
    if (!cur || r.n > cur.n) best.set(s, { c: String(r._id.c), n: r.n });
  }
  const map = new Map<string, string>([...best].map(([s, v]) => [s, v.c]));
  const declared = await Shop.find({ categoryId: { $exists: true, $ne: null } }).select('categoryId').lean();
  for (const d of declared) if (!map.has(String(d._id)) && d.categoryId) map.set(String(d._id), String(d.categoryId));
  return map;
}
