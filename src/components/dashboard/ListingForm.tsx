'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LISTING_CONFIG, type ListingType } from '@/lib/listing-config';
import { FieldsForm, toFormValues, type Values } from '@/components/forms/FieldsForm';

export function ListingForm({ type, id, initial }: { type: ListingType; id?: string; initial?: Values }) {
  const cfg = LISTING_CONFIG[type];
  const router = useRouter();
  const [v, setV] = useState<Values>(() => toFormValues(cfg.fields, initial));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(submit: boolean) {
    setSaving(true); setError('');
    const res = await fetch(id ? `/api/dashboard/listings/${type}/${id}` : `/api/dashboard/listings/${type}`, {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, submit }),
    }).then((r) => r.json()).catch(() => ({ success: false, error: 'Erreur réseau' }));
    setSaving(false);
    if (!res.success) return setError(res.error || 'Erreur');
    router.push(`/dashboard/listings/${type}`);
    router.refresh();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(false); }} className="space-y-5">
      {error && <p className="rounded-md bg-red-500/15 text-red-300 text-sm p-3">{error}</p>}
      <FieldsForm fields={cfg.fields} values={v} onChange={setV} />
      <div className="flex flex-wrap gap-3 pt-2">
        <button disabled={saving} className="px-5 py-2.5 rounded-md bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-50">Enregistrer en brouillon</button>
        <button type="button" disabled={saving} onClick={() => save(true)} className="px-5 py-2.5 rounded-md bg-emerald-brand text-white text-sm font-semibold hover:bg-emerald-light disabled:opacity-50">
          {saving ? 'Enregistrement…' : 'Soumettre pour validation'}
        </button>
      </div>
    </form>
  );
}
