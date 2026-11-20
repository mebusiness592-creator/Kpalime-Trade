import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { TouristSite } from '@/models/TouristSite';
import { taxonomyLabels } from '@/lib/taxonomy';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { FavoriteButton } from '@/components/inquiry/FavoriteButton';
import { Gallery, EntityCard } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
const live = { isActive: true, status: { $in: ['approved', null] } };
const DIFF: Record<string, string> = { easy: 'Facile', medium: 'Moyenne', hard: 'Difficile' };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const s = await TouristSite.findOne({ slug, ...live }).lean();
  return s ? { title: s.name, description: s.shortDescription } : { title: 'Site introuvable' };
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const doc = await TouristSite.findOne({ slug, ...live }).lean();
  if (!doc) notFound();
  const s = JSON.parse(JSON.stringify(doc));
  const [labels, similar] = await Promise.all([taxonomyLabels('tourism'), TouristSite.find({ ...live, category: s.category, _id: { $ne: doc._id } }).limit(4).lean()]);
  const imgs = (s.images ?? []).map((x: { secure_url: string }) => x.secure_url);
  const facts: [string, string | undefined][] = [
    ['Adresse / accès', s.address], ['Ville', s.city], ['Horaires', s.openingHours], ['Durée de la visite', s.duration],
    ['Meilleure période', s.bestPeriod], ['Difficulté', s.difficulty ? DIFF[s.difficulty] : undefined],
    ['Entrée', s.entranceFee ? `${s.entranceFee.toLocaleString('fr-FR')} FCFA` : 'Libre'], ['Contact', s.contactPhone],
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <nav className="text-sm text-muted"><Link href="/tourism" className="hover:text-white">Sites touristiques</Link> / {labels[s.category] ?? s.category}</nav>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2"><h1 className="text-3xl md:text-4xl font-bold text-white">{s.name}</h1><p className="text-white/80">{s.shortDescription}</p></div>
        <FavoriteButton targetType="tourism" targetId={s._id} name={s.name} path={`/tourism/${s.slug}`} image={imgs[0]} />
      </div>
      <Gallery images={imgs} alt={s.name} />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-2"><h2 className="text-xl font-semibold text-white">À propos</h2><p className="text-white/80 whitespace-pre-wrap leading-relaxed">{s.description}</p></section>
          {s.activities?.length > 0 && <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Activités</h2><div className="flex flex-wrap gap-2">{s.activities.map((a: string) => <span key={a} className="px-3 py-1 rounded-full bg-white/10 text-sm text-white">{a}</span>)}</div></section>}
          <dl className="grid sm:grid-cols-2 gap-3 rounded-xl border border-white/10 bg-night-light p-5 text-sm">
            {facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="text-white">{v}</dd></div>)}
          </dl>
          {s.gpsLat && s.gpsLng && <a href={`https://www.google.com/maps?q=${s.gpsLat},${s.gpsLng}`} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-md bg-white/10 text-white text-sm hover:bg-white/20">📍 Voir sur la carte</a>}
        </div>
        <InquiryForm targetType="tourism" targetId={s._id} targetName={s.name} />
      </div>
      {similar.length > 0 && <section className="space-y-4"><h2 className="text-xl font-semibold text-white">À découvrir aussi</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{similar.map((x) => <EntityCard key={String(x._id)} href={`/tourism/${x.slug}`} image={x.images?.[0]?.secure_url} title={x.name} subtitle={x.city} />)}</div></section>}
    </div>
  );
}
