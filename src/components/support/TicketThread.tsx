'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/upload-client';
import { STATUS_LABELS } from '@/lib/support-labels';

export interface ThreadMessage { authorRole: 'user' | 'admin'; body: string; attachments?: string[]; createdAt: string }

interface Props {
  ticketId: string;
  messages: ThreadMessage[];
  status: string;
  mode: 'user' | 'admin';
  onChanged: () => void;
}

const STATUSES = ['new', 'awaiting_admin', 'in_progress', 'awaiting_user', 'resolved', 'closed'];

export function TicketThread({ ticketId, messages, status, mode, onChanged }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const base = mode === 'admin' ? `/api/admin/support/${ticketId}` : `/api/support/${ticketId}`;

  async function attach(file: File) {
    try { const up = await uploadImage(file); setFiles((f) => [...f, up.url]); } catch (e) { setError(e instanceof Error ? e.message : 'Erreur d’envoi'); }
  }
  async function send(newStatus?: string) {
    setSending(true); setError('');
    const r = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text || undefined, attachments: files, status: newStatus }) }).then((x) => x.json());
    setSending(false);
    if (!r.success) return setError(r.error || 'Erreur');
    setText(''); setFiles([]); onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {messages.map((m, i) => {
          const mine = (mode === 'admin') === (m.authorRole === 'admin');
          return (
            <div key={i} className={`max-w-[85%] rounded-lg p-3 text-sm ${mine ? 'ml-auto bg-emerald-600/20 text-white' : 'bg-white/10 text-gray-200'}`}>
              <p className="text-[11px] opacity-60 mb-1">{m.authorRole === 'admin' ? 'Kpalimé-Trade' : 'Utilisateur'} · {new Date(m.createdAt).toLocaleString('fr-FR')}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
              {m.attachments?.map((u) => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block mt-2 text-xs underline">Pièce jointe</a>
              ))}
            </div>
          );
        })}
      </div>

      {status === 'closed' ? (
        <p className="text-sm text-gray-400">Ce dossier est fermé.</p>
      ) : (
        <div className="space-y-2">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Votre réponse…" className="w-full rounded-md bg-black/20 border border-white/10 p-3 text-sm text-white" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer text-xs px-3 py-1.5 rounded bg-white/10 text-gray-200">
              Joindre une image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(f); e.target.value = ''; }} />
            </label>
            {files.length > 0 && <span className="text-xs text-gray-400">{files.length} pièce(s) jointe(s)</span>}
            <button disabled={sending || !text.trim()} onClick={() => send()} className="ml-auto px-4 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-50">Envoyer</button>
          </div>
          {mode === 'admin' && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-gray-400">Statut :</span>
              <select value={status} onChange={(e) => send(e.target.value)} className="text-xs bg-black/30 text-gray-200 rounded p-1.5">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
