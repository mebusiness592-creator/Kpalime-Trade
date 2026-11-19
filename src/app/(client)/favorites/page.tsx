'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Fav { _id: string; targetType: string; targetId: string; name: string; path: string; image?: string }
const LABEL: Record<string, string> = { product: 'Produit', shop: 'Boutique', hotel: 'Hôtel', restaurant: 'Restaurant', service: 'Service', tourism: 'Site touristique' };

export default function FavoritesPage() {
  const [items, setItems] = useState<Fav[] | null>(null);
  const load = useCallback(() => { fetch('/api/favorites').then((r) => r.json()).then((r) => setItems(r.success ? r.data : [])); }, []);
  useEffect(() => { load(); }, [load]);
  async function remove(f: Fav) {
    await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType: f.targetType, targetId: f.targetId, name: f.name, path: f.path }) });
    load();
  }
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Mes favoris</h1>
      {items === null ? <p className="text-sm text-muted">Chargement…</p> : items.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-muted">Aucun favori. Cliquez sur ❤ sur une fiche pour l’enregistrer.</p> : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {items.map((f) => (
            <li key={f._id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-light p-3">
              {f.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.image} alt="" className="w-16 h-16 rounded-md object-cover" />}
              <div className="flex-1 min-w-0"><Link href={f.path} className="font-medium text-white hover:text-gold block truncate">{f.name}</Link><span className="text-xs text-muted">{LABEL[f.targetType] ?? f.targetType}</span></div>
              <button onClick={() => remove(f)} className="text-xs text-red-300 hover:underline">Retirer</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
