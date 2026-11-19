'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LISTING_CONFIG, STATUS_META, type ListingType } from '@/lib/listing-config';
import { ListingForm } from '@/components/dashboard/ListingForm';

export default function EditListingPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const cfg = LISTING_CONFIG[type as ListingType];
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch(`/api/dashboard/listings/${type}/${id}`).then((r) => r.json()).then((r) => (r.success ? setDoc(r.data) : setError(r.error))); }, [type, id]);
  if (!cfg) return <p className="text-muted">Page introuvable.</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!doc) return <p className="text-muted text-sm">Chargement…</p>;
  const m = STATUS_META[doc.status as string];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Modifier : {doc.name as string}</h1>
        {m && <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>}
      </div>
      {typeof doc.adminNote === 'string' && doc.adminNote && <p className="text-sm rounded-md bg-orange-500/10 text-orange-200 p-3"><strong>Message de l’administration :</strong> {doc.adminNote}</p>}
      {doc.status === 'approved' && <p className="text-xs text-muted">Fiche publiée : modifier le nom, la description ou les photos la remet en validation avant republication.</p>}
      <div className="rounded-xl border border-white/10 bg-night-light p-5"><ListingForm type={type as ListingType} id={id} initial={doc} /></div>
    </div>
  );
}
