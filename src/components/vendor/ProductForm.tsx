'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FieldsForm, toFormValues, type Values } from '@/components/forms/FieldsForm';
import { productFields } from '@/lib/vendor-config';

interface Props { categories: { value: string; label: string }[]; id?: string; initial?: Values }

export function ProductForm({ categories, id, initial }: Props) {
  const router = useRouter();
  const fields = productFields(categories);
  const [v, setV] = useState<Values>(() => toFormValues(fields, initial ? { ...initial, categoryId: String(initial.categoryId ?? '') } : undefined));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const r = await fetch(id ? `/api/products/${id}` : '/api/products', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).then((x) => x.json()).catch(() => ({ success: false, error: 'Erreur réseau' }));
    setSaving(false);
    if (!r.success) return setError(r.error);
    router.push('/vendor/products'); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-5 max-w-3xl rounded-xl border border-white/10 bg-night-light p-5">
      {error && <p className="rounded-md bg-red-500/15 text-red-300 text-sm p-3">{error}</p>}
      <FieldsForm fields={fields} values={v} onChange={setV} />
      <p className="text-xs text-muted">Votre produit sera visible après validation par l’équipe Kpalimé-Trade.</p>
      <button disabled={saving} className="px-5 py-2.5 rounded-md bg-emerald-brand text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Enregistrement…' : id ? 'Enregistrer' : 'Soumettre le produit'}</button>
    </form>
  );
}
