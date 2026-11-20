import { unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Taxonomy } from '@/models/Taxonomy';
import { Category } from '@/models/Category';

export interface TaxItem { value: string; label: string; slug: string; image?: string; description?: string; keywords?: string[] }

/** Liste des catégories d'un type (kind = 'product' lit les catégories de produits). */
export const getTaxonomy = unstable_cache(
  async (kind: string): Promise<TaxItem[]> => {
    try {
      await connectDB();
      if (kind === 'product') {
        const rows = await Category.find({ isActive: true }).sort({ position: 1, name: 1 }).lean();
        return rows.map((c) => ({ value: String(c._id), label: c.name, slug: c.slug, image: c.image, description: c.description }));
      }
      const rows = await Taxonomy.find({ kind, isActive: true }).sort({ position: 1, name: 1 }).lean();
      return rows.map((t) => ({ value: t.slug, label: t.name, slug: t.slug, image: t.image, description: t.description, keywords: t.keywords }));
    } catch { return []; }
  },
  ['taxonomy'], { revalidate: 60, tags: ['taxonomy'] }
);

export async function taxonomyLabels(kind: string): Promise<Record<string, string>> {
  return Object.fromEntries((await getTaxonomy(kind)).map((t) => [t.value, t.label]));
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Détection automatique : choisit la catégorie dont les mots-clés (ou le nom) apparaissent le plus dans le texte. */
export async function detectCategory(kind: string, text: string): Promise<string | undefined> {
  const items = await getTaxonomy(kind);
  const hay = norm(text);
  let best: { v: string; score: number } | undefined;
  for (const it of items) {
    const words = [it.label, ...(it.keywords ?? [])].map(norm).filter((w) => w.length > 2);
    const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { v: it.value, score };
  }
  return best?.v;
}
