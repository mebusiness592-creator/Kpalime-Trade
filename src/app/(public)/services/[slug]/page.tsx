import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Professional } from '@/models/Professional';
import { taxonomyLabels } from '@/lib/taxonomy';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { FavoriteButton } from '@/components/inquiry/FavoriteButton';
import { ContactButtons, Gallery, EntityCard } from '@/components/public/blocks';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
const live = { isActive: true, status: { $in: ['approved', null] } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const p = await Professional.findOne({ slug, ...live }).lean();
  return p ? { title: p.name, description: String(p.description).slice(0, 150) } : { title: 'Service introuvable' };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const doc = await Professional.findOne({ slug, ...live }).lean();
  if (!doc) notFound();
  const p = JSON.parse(JSON.stringify(doc));
  const [labels, similar] = await Promise.all([taxonomyLabels('service'), Professional.find({ ...live, category: p.category, _id: { $ne: doc._id } }).limit(4).lean()]);
  const gallery = (p.portfolio ?? []).map((x: { secure_url: string }) => x.secure_url);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <nav className="text-sm text-muted"><Link href="/services" className="hover:text-white">Entreprises & services</Link> / {labels[p.category] ?? p.category}</nav>
      <div className="flex flex-col md:flex-row gap-5 md:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.logo || PLACEHOLDER_IMG} alt={p.name} className="w-24 h-24 rounded-xl object-cover bg-night-light" />
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold text-white">{p.name}</h1>
          <p className="text-sm text-muted">{[p.address, p.city].filter(Boolean).join(' · ')}</p>
          <span className="inline-block px-3 py-1 rounded-full bg-gold/15 text-gold text-xs">{labels[p.category] ?? p.category}</span>
        </div>
        <FavoriteButton targetType="service" targetId={p._id} name={p.name} path={`/services/${p.slug}`} image={p.logo} />
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Présentation</h2><p className="text-white/80 whitespace-pre-wrap leading-relaxed">{p.description}</p></section>
          {p.skills?.length > 0 && <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Services proposés</h2><div className="flex flex-wrap gap-2">{p.skills.map((s: string) => <span key={s} className="px-3 py-1 rounded-full bg-white/10 text-sm text-white">{s}</span>)}</div></section>}
          <div className="text-sm text-muted space-y-1">{p.availability && <p>Disponibilité : {p.availability}</p>}{p.priceRange && <p>Tarifs : {p.priceRange}</p>}</div>
          <ContactButtons phone={p.phone} whatsapp={p.whatsapp} email={p.email} />
          {gallery.length > 0 && <section className="space-y-3"><h2 className="text-xl font-semibold text-white">Réalisations</h2><Gallery images={gallery} alt={p.name} /></section>}
        </div>
        <InquiryForm targetType="service" targetId={p._id} targetName={p.name} />
      </div>
      {similar.length > 0 && (
        <section className="space-y-4"><h2 className="text-xl font-semibold text-white">Dans la même catégorie</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{similar.map((x) => <EntityCard key={String(x._id)} href={`/services/${x.slug}`} image={x.logo} title={x.name} subtitle={x.city} />)}</div></section>
      )}
    </div>
  );
}
