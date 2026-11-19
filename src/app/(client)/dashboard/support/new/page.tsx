'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/upload-client';
import { useRouter } from 'next/navigation';
import { SUBJECT_LABELS } from '@/lib/support-labels';

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('other');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function attach(file: File) {
    try { const up = await uploadImage(file); setFiles((f) => [...f, up.url]); } catch (e) { setError(e instanceof Error ? e.message : 'Erreur d’envoi'); }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    const r = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, title, message, attachments: files }) }).then((x) => x.json());
    setLoading(false);
    if (!r.success) return setError(r.error || 'Erreur');
    router.push(`/dashboard/support/${r.data._id}`);
  }
  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 bg-night-light text-white rounded-xl border border-white/10 p-6">
      <h1 className="text-xl font-bold">Nouvelle demande d’assistance</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-night text-white border border-white/10 rounded-md p-2 text-sm">
        {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sujet de votre demande" required minLength={3} className="w-full bg-night text-white border border-white/10 rounded-md p-2 text-sm" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Décrivez votre demande" required minLength={5} rows={6} className="w-full bg-night text-white border border-white/10 rounded-md p-2 text-sm" />
      <div className="flex items-center gap-3 text-sm">
        <label className="cursor-pointer px-3 py-1.5 rounded bg-white/10">Joindre une image<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(f); e.target.value = ''; }} /></label>
        {files.length > 0 && <span className="text-muted">{files.length} pièce(s) jointe(s)</span>}
      </div>
      <button disabled={loading} className="px-4 py-2 rounded-md bg-kpalime-green text-white text-sm disabled:opacity-50">{loading ? 'Envoi…' : 'Envoyer'}</button>
    </form>
  );
}
