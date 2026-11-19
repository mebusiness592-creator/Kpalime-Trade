'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminResource } from '@/components/admin/AdminResource';
import { ADMIN_RESOURCES, PUBLICATION_TABS } from '@/lib/admin-config';

const MAP: Record<string, string> = { hotel: 'hotels', restaurant: 'restaurants', service: 'services', tourism: 'tourism' };

function Inner() {
  const sp = useSearchParams();
  const initial = MAP[sp.get('type') || ''] || sp.get('type') || 'hotels';
  const [tab, setTab] = useState<string>(PUBLICATION_TABS.includes(initial as never) ? initial : 'hotels');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Publications à valider</h1>
        <p className="text-sm text-gray-400">Contrôlez les fiches soumises par les professionnels : approuver, demander une correction (avec message) ou refuser.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PUBLICATION_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-300'}`}>{ADMIN_RESOURCES[t].label}</button>
        ))}
      </div>
      <AdminResource key={tab} resource={tab} />
    </div>
  );
}

export default function PublicationsPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
