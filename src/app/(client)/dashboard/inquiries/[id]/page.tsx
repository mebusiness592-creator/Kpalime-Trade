'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Inq { _id: string; reference: string; kind: string; targetName: string; name: string; email: string; phone?: string; message: string; status: string; createdAt: string; details?: Record<string, string | number>; replies: { fromRecipient: boolean; body: string; createdAt: string }[] }

export default function InquiryPage() {
  const { id } = useParams<{ id: string }>();
  const [inq, setInq] = useState<Inq | null>(null);
  const [isRecipient, setIsRecipient] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { fetch(`/api/inquiries/${id}`).then((r) => r.json()).then((r) => { if (r.success) { setInq(r.data); setIsRecipient(r.isRecipient); } }); }, [id]);
  useEffect(() => { load(); }, [load]);
  async function send(body: { message?: string; status?: string }) {
    setBusy(true);
    await fetch(`/api/inquiries/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setBusy(false); setText(''); load();
  }
  if (!inq) return <p className="text-sm text-muted">Chargement…</p>;
  return (
    <div className="space-y-4">
      <Link href="/dashboard/inquiries" className="text-sm text-emerald-light hover:underline">← Toutes les demandes</Link>
      <div className="rounded-xl border border-white/10 bg-night-light p-5 space-y-2">
        <h1 className="text-xl font-bold text-white">{inq.reference} · {inq.targetName}</h1>
        <p className="text-sm text-muted">{inq.name} · {inq.email}{inq.phone ? ` · ${inq.phone}` : ''}</p>
        {inq.details && Object.keys(inq.details).length > 0 && <p className="text-xs text-gold">{Object.entries(inq.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>}
        <p className="whitespace-pre-wrap text-white/90 text-sm pt-2">{inq.message}</p>
      </div>
      {inq.replies.map((r, i) => (
        <div key={i} className={`max-w-[85%] rounded-lg p-3 text-sm ${r.fromRecipient === isRecipient ? 'ml-auto bg-emerald-brand/20' : 'bg-white/10'} text-white`}>
          <p className="text-[11px] opacity-60 mb-1">{r.fromRecipient ? 'Professionnel' : 'Demandeur'} · {new Date(r.createdAt).toLocaleString('fr-FR')}</p>{r.body}
        </div>
      ))}
      {inq.status !== 'closed' && (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Votre réponse…" className="w-full rounded-md bg-night border border-white/10 p-3 text-sm text-white" />
          <div className="flex gap-2">
            <button disabled={busy || !text.trim()} onClick={() => send({ message: text })} className="px-4 py-2 rounded-md bg-emerald-brand text-white text-sm disabled:opacity-50">Envoyer</button>
            {isRecipient && <button onClick={() => send({ status: 'closed' })} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm">Clôturer</button>}
          </div>
        </div>
      )}
    </div>
  );
}
