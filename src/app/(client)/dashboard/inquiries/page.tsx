'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Row { _id: string; reference: string; kind: string; targetName: string; name: string; status: string; createdAt: string }
const KIND: Record<string, string> = { info: 'Renseignements', quote: 'Devis', reservation: 'Réservation' };
const STATUS: Record<string, string> = { new: 'Nouvelle', read: 'Lue', replied: 'Répondue', closed: 'Clôturée' };

export default function InquiriesPage() {
  const { user } = useAuth();
  const [box, setBox] = useState<'received' | 'sent'>('received');
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { setRows(null); fetch(`/api/inquiries?box=${box}`).then((r) => r.json()).then((r) => setRows(r.success ? r.data : [])); }, [box]);
  const canReceive = user && user.role !== 'client';
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Demandes & devis</h1>
      <div className="flex gap-2">
        {canReceive && <button onClick={() => setBox('received')} className={`px-4 py-2 rounded-md text-sm ${box === 'received' ? 'bg-emerald-brand text-white' : 'bg-white/10 text-muted'}`}>Reçues</button>}
        <button onClick={() => setBox('sent')} className={`px-4 py-2 rounded-md text-sm ${box === 'sent' || !canReceive ? 'bg-emerald-brand text-white' : 'bg-white/10 text-muted'}`}>Envoyées</button>
      </div>
      {rows === null ? <p className="text-sm text-muted">Chargement…</p> : rows.length === 0 ? <p className="text-sm text-muted">Aucune demande.</p> : (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-night-light">
          {rows.map((r) => (
            <li key={r._id}><Link href={`/dashboard/inquiries/${r._id}`} className="flex justify-between gap-3 p-4 hover:bg-white/5">
              <span><span className="font-medium text-white">{r.targetName}</span><br /><span className="text-xs text-muted">{r.reference} · {KIND[r.kind]} · {box === 'received' ? r.name : 'Vous'} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</span></span>
              <span className={`text-xs self-center ${r.status === 'new' ? 'text-gold font-semibold' : 'text-muted'}`}>{STATUS[r.status]}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
