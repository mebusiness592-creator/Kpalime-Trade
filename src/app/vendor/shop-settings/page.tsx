'use client';

import { useEffect, useState } from 'react';
import { FieldsForm, toFormValues, type Values } from '@/components/forms/FieldsForm';
import { SHOP_FIELDS } from '@/lib/vendor-config';
import { STATUS_META } from '@/lib/listing-config';

export default function ShopSettingsPage() {
  const [v, setV] = useState<Values | null>(null);
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/shops/me').then((r) => r.json()).then((r) => {
      if (r.data) { setExists(true); setStatus(r.data.status); setV(toFormValues(SHOP_FIELDS, r.data)); } else setV({ city: 'Kpalimé' });
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const r = await fetch(exists ? '/api/shops/me' : '/api/shops', { method: exists ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).then((x) => x.json());
    setSaving(false);
    setMsg({ ok: r.success, t: r.success ? (exists ? 'Boutique mise à jour' : 'Boutique créée : elle sera visible après validation.') : r.error });
    if (r.success) { setExists(true); setStatus(r.data.status); }
  }
  if (!v) return <p className="text-muted text-sm">Chargement…</p>;
  const m = STATUS_META[status];
  return (
    <form onSubmit={save} className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-white">{exists ? 'Ma boutique' : 'Créer ma boutique'}</h1>{m && <span className={`px-2.5 py-0.5 rounded-full text-xs ${m.cls}`}>{m.label}</span>}</div>
      {msg && <p className={`rounded-md text-sm p-3 ${msg.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{msg.t}</p>}
      <div className="rounded-xl border border-white/10 bg-night-light p-5"><FieldsForm fields={SHOP_FIELDS} values={v} onChange={setV} /></div>
      <button disabled={saving} className="px-5 py-2.5 rounded-md bg-emerald-brand text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Enregistrement…' : exists ? 'Enregistrer' : 'Créer la boutique'}</button>
    </form>
  );
}
