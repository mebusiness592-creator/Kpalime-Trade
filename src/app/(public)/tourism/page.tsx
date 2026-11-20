import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { TouristSite } from '@/models/TouristSite';
import { getTaxonomy } from '@/lib/taxonomy';
import { getSiteImageMap } from '@/lib/site-images';
import { pageParams, regex, PAGE_SIZE } from '@/lib/public-data';
import { PageHero, SearchBar, CategoryChips, EntityCard, Empty, Pager } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sites touristiques', description: 'Cascades, montagnes, villages et patrimoine du Togo.' };

export default async function TourismPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, category, page } = await pageParams(searchParams);
  await connectDB();
  const [cats, images] = await Promise.all([getTaxonomy('tourism'), getSiteImageMap()]);
  const live = { isActive: true, status: { $in: ['approved', null] } };
  const counts: { _id: string; n: number }[] = await TouristSite.aggregate([{ $match: live }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [c._id, c.n]));
  const filter: Record<string, unknown> = { ...live };
  if (q) filter.$or = [{ name: regex(q) }, { shortDescription: regex(q) }, { city: regex(q) }];
  if (category) filter.category = category;
  const [total, rows] = await Promise.all([
    TouristSite.countDocuments(filter),
    TouristSite.find(filter).sort({ isFeatured: -1, name: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
  ]);
  const label = (v: string) => cats.find((c) => c.value === v)?.label ?? (v && v !== 'autre' ? v : 'Autre');
  const chips = [...countMap.keys()].map((v) => ({ value: v, label: label(v), count: countMap.get(v) }));
  return (
    <div>
      <PageHero title="Sites touristiques" subtitle="Découvrez les lieux à visiter, les activités et les guides du Togo." image={images['page.tourism.banner']?.url}>
        <div className="space-y-3"><SearchBar action="/tourism" q={q} category={category} placeholder="Rechercher un site, une ville…" /><Link href="/tourism/guides" className="inline-block text-sm text-gold hover:underline">Trouver un guide touristique →</Link></div>
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CategoryChips base="/tourism" q={q} active={category} items={chips} />
        {rows.length === 0 ? <Empty text="Aucun site touristique pour le moment." cta={{ href: '/auth/register', label: 'Présenter mon site' }} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rows.map((s) => <EntityCard key={String(s._id)} href={`/tourism/${s.slug}`} image={s.images?.[0]?.secure_url} title={s.name} subtitle={s.city} badge={label(s.category)} text={s.shortDescription} footer={s.entranceFee ? `Entrée : ${s.entranceFee.toLocaleString('fr-FR')} FCFA` : 'Entrée libre'} />)}
          </div>
        )}
        <Pager base="/tourism" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }} />
      </div>
    </div>
  );
}
