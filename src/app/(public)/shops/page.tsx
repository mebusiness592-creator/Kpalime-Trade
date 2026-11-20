import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Shop } from '@/models/Shop';
import { getTaxonomy } from '@/lib/taxonomy';
import { getSiteImageMap } from '@/lib/site-images';
import { shopCategoryMap, pageParams, regex, PAGE_SIZE } from '@/lib/public-data';
import { PageHero, SearchBar, CategoryChips, EntityCard, Empty, Pager } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Boutiques & fournisseurs', description: 'Les boutiques et fournisseurs du Togo, classés automatiquement par type de produits.' };

export default async function ShopsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, category, page } = await pageParams(searchParams);
  await connectDB();
  const [cats, map, images] = await Promise.all([getTaxonomy('product'), shopCategoryMap(), getSiteImageMap()]);
  const counts = new Map<string, number>();
  for (const c of map.values()) counts.set(c, (counts.get(c) ?? 0) + 1);
  const cat = cats.find((c) => c.slug === category);
  const filter: Record<string, unknown> = { status: 'approved' };
  if (q) filter.$or = [{ name: regex(q) }, { description: regex(q) }, { city: regex(q) }];
  if (cat) filter._id = { $in: [...map].filter(([, c]) => c === cat.value).map(([s]) => s) };
  const [total, shops] = await Promise.all([
    Shop.countDocuments(filter),
    Shop.find(filter).sort({ isFeatured: -1, name: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
  ]);
  const label = (id?: string) => cats.find((c) => c.value === id)?.label;
  return (
    <div>
      <PageHero title="Boutiques & fournisseurs" subtitle="Chaque boutique est rangée automatiquement dans le type correspondant à ses produits (légumes, café, artisanat…)." image={images['page.shops.banner']?.url}>
        <SearchBar action="/shops" q={q} category={category} placeholder="Rechercher une boutique ou une ville…" />
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CategoryChips base="/shops" q={q} active={category} items={cats.filter((c) => counts.has(c.value)).map((c) => ({ value: c.slug, label: c.label, count: counts.get(c.value) }))} />
        {shops.length === 0 ? <Empty text="Aucune boutique ne correspond à votre recherche." cta={{ href: '/auth/register', label: 'Ouvrir ma boutique' }} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shops.map((s) => <EntityCard key={String(s._id)} href={`/shops/${s.slug}`} image={s.banner || s.logo} title={s.name} subtitle={[s.city, s.district].filter(Boolean).join(' · ')} badge={label(map.get(String(s._id)))} text={s.description} />)}
          </div>
        )}
        <Pager base="/shops" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }} />
      </div>
    </div>
  );
}
