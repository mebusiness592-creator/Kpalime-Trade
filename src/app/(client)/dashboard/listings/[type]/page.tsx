'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LISTING_CONFIG, STATUS_META, type ListingType } from '@/lib/listing-config';

interface Item { _id: string; name: string; slug: string; status: string; adminNote?: string; updatedAt: string }

export default function ListingsPage() {
  const { type } = useParams<{ type: string }>();
  const cfg = LISTING_CONFIG[type as ListingType];
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    fetch(`/api/dashboard/listings/${type}`).then((r) => r.json()).then((r) => (r.success ? setItems(r.data) : setError(r.error)));
  }, [type]);
  useEffect(() => { load(); }, [load]);
  if (!cfg) return <p className="text-muted">Page introuvable.</p>;

  async function act(id: string, action: 'submit' | 'delete') {
    if (action === 'delete' && !confirm('Supprimer cette fiche définitivement ?')) return;
    await fetch(action === 'delete' ? `/api/dashboard/listings/${type}/${id}` : `/api/dashboard/listings/${type}/${id}/submit`, { method: action === 'delete' ? 'DELETE' : 'POST' });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">{cfg.plural}</h1>
        <Link href={`/dashboard/listings/${type}/new`} className="px-4 py-2 rounded-md bg-emerald-brand text-white text-sm font-semibold hover:bg-emerald-light">+ Ajouter</Link>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {items === null ? <p className="text-muted text-sm">Chargement…</p> : items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-night-light p-8 text-center text-muted">Aucune fiche pour le moment. Créez la première : elle sera visible après validation par l’équipe Kpalimé-Trade.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const m = STATUS_META[it.status] ?? STATUS_META.draft;
            return (
              <li key={it._id} className="rounded-xl border border-white/10 bg-night-light p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{it.name}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {it.status === 'approved' && <Link href={`${cfg.publicPath}/${it.slug}`} className="px-3 py-1.5 rounded bg-white/10 text-white">Voir</Link>}
                    <Link href={`/dashboard/listings/${type}/${it._id}`} className="px-3 py-1.5 rounded bg-white/10 text-white">Modifier</Link>
                    {['draft', 'needs_correction', 'rejected'].includes(it.status) && <button onClick={() => act(it._id, 'submit')} className="px-3 py-1.5 rounded bg-emerald-brand text-white">Soumettre</button>}
                    <button onClick={() => act(it._id, 'delete')} className="px-3 py-1.5 rounded text-red-300 hover:bg-red-500/10">Supprimer</button>
                  </div>
                </div>
                {it.adminNote && <p className="text-sm rounded-md bg-orange-500/10 text-orange-200 p-3"><strong>Message de l’administration :</strong> {it.adminNote}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
