'use client';

import { useState } from 'react';

const field = 'w-full rounded-md bg-night border border-white/10 px-3 py-2 text-sm text-white placeholder-muted focus:border-emerald-brand focus:outline-none';

export function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending'); setError('');
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, phone: f.phone || undefined }) }).then((x) => x.json()).catch(() => ({ success: false, error: 'Erreur réseau' }));
    if (r.success) setState('done'); else { setState('idle'); setError(r.error); }
  }
  if (state === 'done') return <div className="rounded-xl border border-emerald-brand/40 bg-emerald-brand/10 p-6 text-emerald-100">Merci ! Votre message a bien été envoyé.</div>;
  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-night-light p-6 space-y-3">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <input className={field} placeholder="Votre nom" required onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={field} type="email" placeholder="Votre e-mail" required onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={field} placeholder="Téléphone (optionnel)" onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className={field} placeholder="Sujet" required minLength={3} onChange={(e) => setF({ ...f, subject: e.target.value })} />
      <textarea className={field} rows={5} placeholder="Votre message" required minLength={10} onChange={(e) => setF({ ...f, message: e.target.value })} />
      <button disabled={state === 'sending'} className="w-full px-4 py-2.5 rounded-md bg-emerald-brand text-white font-semibold disabled:opacity-50">{state === 'sending' ? 'Envoi…' : 'Envoyer'}</button>
    </form>
  );
}
