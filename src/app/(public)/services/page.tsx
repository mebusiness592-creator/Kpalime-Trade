import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Professional } from '@/models/Professional';
import { getTaxonomy } from '@/lib/taxonomy';
import { getSiteImageMap } from '@/lib/site-images';
import { pageParams, regex, PAGE_SIZE } from '@/lib/public-data';
import { PageHero, SearchBar, CategoryChips, EntityCard, Empty, Pager } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entreprises & services', description: 'Annuaire des entreprises, artisans et prestataires de services du Togo.' };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, category, page } = await pageParams(searchParams);
  await connectDB();
  const [cats, images] = await Promise.all([getTaxonomy('service'), getSiteImageMap()]);
  const live = { isActive: true, status: { $in: ['approved', null] } };
  const counts: { _id: string; n: number }[] = await Professional.aggregate([{ $match: live }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [c._id, c.n]));
  const filter: Record<string, unknown> = { ...live };
  if (q) filter.$or = [{ name: regex(q) }, { description: regex(q) }, { skills: regex(q) }, { city: regex(q) }];
  if (category) filter.category = category;
  const [total, rows] = await Promise.all([
    Professional.countDocuments(filter),
    Professional.find(filter).sort({ isFeatured: -1, name: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
  ]);
  const label = (v: string) => cats.find((c) => c.value === v)?.label ?? (v && v !== 'autre' ? v : 'Autre');
  const chips = [...new Set([...cats.map((c) => c.value), ...countMap.keys()])].filter((v) => countMap.has(v)).map((v) => ({ value: v, label: label(v), count: countMap.get(v) }));
  return (
    <div>
      <PageHero title="Entreprises & services" subtitle="Construction, transport, numérique, artisanat, conseil… Trouvez le bon professionnel, classé automatiquement par activité." image={images['page.services.banner']?.url}>
        <SearchBar action="/services" q={q} category={category} placeholder="Rechercher un service, une compétence, une ville…" />
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CategoryChips base="/services" q={q} active={category} items={chips} />
        {rows.length === 0 ? <Empty text="Aucun professionnel ne correspond à votre recherche." cta={{ href: '/auth/register', label: 'Inscrire mon entreprise' }} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rows.map((p) => <EntityCard key={String(p._id)} href={`/services/${p.slug}`} image={p.logo || p.portfolio?.[0]?.secure_url} title={p.name} subtitle={[p.city, p.availability].filter(Boolean).join(' · ')} badge={label(p.category)} text={p.description} footer={p.priceRange} />)}
          </div>
        )}
        <Pager base="/services" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }} />
      </div>
    </div>
  );
}
