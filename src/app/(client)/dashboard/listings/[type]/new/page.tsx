import { notFound } from 'next/navigation';
import { LISTING_CONFIG, type ListingType } from '@/lib/listing-config';
import { ListingForm } from '@/components/dashboard/ListingForm';

export default async function NewListingPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const cfg = LISTING_CONFIG[type as ListingType];
  if (!cfg) notFound();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Nouveau {cfg.label}</h1>
      <p className="text-sm text-muted">Votre fiche sera examinée par l’équipe avant d’être visible publiquement.</p>
      <div className="rounded-xl border border-white/10 bg-night-light p-5"><ListingForm type={type as ListingType} /></div>
    </div>
  );
}
