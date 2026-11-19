'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Target = 'product' | 'shop' | 'hotel' | 'restaurant' | 'service' | 'tourism';

const KINDS: Record<Target, { value: 'info' | 'quote' | 'reservation'; label: string }[]> = {
  product: [{ value: 'quote', label: 'Demande de prix / devis' }, { value: 'info', label: 'Renseignements' }],
  shop: [{ value: 'info', label: 'Renseignements' }, { value: 'quote', label: 'Demande de devis' }],
  hotel: [{ value: 'reservation', label: 'Demande de réservation' }, { value: 'info', label: 'Renseignements' }],
  restaurant: [{ value: 'reservation', label: 'Réserver une table' }, { value: 'info', label: 'Renseignements' }],
  service: [{ value: 'quote', label: 'Demande de devis' }, { value: 'info', label: 'Renseignements' }],
  tourism: [{ value: 'info', label: 'Renseignements' }, { value: 'reservation', label: 'Réserver une visite' }],
};

/** Formulaire de contact / devis / réservation relié au propriétaire de la fiche. */
export function InquiryForm({ targetType, targetId, targetName }: { targetType: Target; targetId: string; targetName: string }) {
  const { user } = useAuth();
  const kinds = KINDS[targetType];
  const [f, setF] = useState({ kind: kinds[0].value, name: '', email: '', phone: '', message: '', quantity: '', checkIn: '', checkOut: '', guests: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const field = 'w-full rounded-md bg-night border border-white/10 px-3 py-2 text-sm text-white placeholder-muted focus:border-emerald-brand focus:outline-none';

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending'); setError('');
    const details: Record<string, unknown> = {};
    if (f.quantity) details.quantity = f.quantity;
    if (f.checkIn) details.checkIn = f.checkIn;
    if (f.checkOut) details.checkOut = f.checkOut;
    if (f.guests) details.guests = Number(f.guests);
    const r = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: f.kind, targetType, targetId, name: f.name || user?.name, email: f.email || user?.email, phone: f.phone || undefined, message: f.message, details }) })
      .then((x) => x.json()).catch(() => ({ success: false, error: 'Erreur réseau' }));
    if (!r.success) { setState('idle'); return setError(r.error); }
    setState('done');
  }

  if (state === 'done') return <div className="rounded-xl border border-emerald-brand/40 bg-emerald-brand/10 p-5 text-sm text-emerald-100">Votre demande a bien été transmise à « {targetName} ». Vous serez contacté par e-mail ou téléphone.</div>;

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-night-light p-5 space-y-3">
      <h3 className="text-lg font-semibold text-white">Contacter {targetName}</h3>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <select className={field} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as typeof f.kind })}>{kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</select>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className={field} placeholder="Votre nom" required defaultValue={user?.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={field} type="email" placeholder="Votre e-mail" required defaultValue={user?.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={field} placeholder="Téléphone / WhatsApp" onChange={(e) => setF({ ...f, phone: e.target.value })} />
        {(targetType === 'product' || targetType === 'shop' || targetType === 'service') && <input className={field} placeholder="Quantité souhaitée" onChange={(e) => setF({ ...f, quantity: e.target.value })} />}
        {f.kind === 'reservation' && (<>
          <input className={field} type="date" aria-label="Date d’arrivée / visite" onChange={(e) => setF({ ...f, checkIn: e.target.value })} />
          {targetType === 'hotel' && <input className={field} type="date" aria-label="Date de départ" onChange={(e) => setF({ ...f, checkOut: e.target.value })} />}
          <input className={field} type="number" min={1} placeholder="Nombre de personnes" onChange={(e) => setF({ ...f, guests: e.target.value })} />
        </>)}
      </div>
      <textarea className={field} rows={4} required minLength={10} placeholder="Votre message" onChange={(e) => setF({ ...f, message: e.target.value })} />
      <button disabled={state === 'sending'} className="w-full px-4 py-2.5 rounded-md bg-emerald-brand text-white text-sm font-semibold hover:bg-emerald-light disabled:opacity-50">{state === 'sending' ? 'Envoi…' : 'Envoyer la demande'}</button>
    </form>
  );
}
