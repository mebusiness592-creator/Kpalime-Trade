'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { STATUS_LABELS, SUBJECT_LABELS } from '@/lib/support-labels';

interface Row { _id: string; reference: string; title: string; subject: string; status: string; updatedAt: string }

export default function SupportListPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { fetch('/api/support').then((r) => r.json()).then((r) => setRows(r.success ? r.data : [])); }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Assistance Kpalimé-Trade</h1>
        <Link href="/dashboard/support/new" className="px-4 py-2 rounded-md bg-kpalime-green text-white text-sm">Nouvelle demande</Link>
      </div>
      {rows === null ? <p className="text-sm text-muted">Chargement…</p> : rows.length === 0 ? <p className="text-sm text-muted">Vous n’avez encore aucune demande.</p> : (
        <ul className="divide-y divide-white/10 rounded-lg border border-white/10 bg-night-light">
          {rows.map((r) => (
            <li key={r._id}>
              <Link href={`/dashboard/support/${r._id}`} className="flex justify-between gap-3 p-4 hover:bg-white/5">
                <span><span className="font-medium text-white">{r.title}</span><br /><span className="text-xs text-muted">{r.reference} · {SUBJECT_LABELS[r.subject]}</span></span>
                <span className="text-xs text-muted whitespace-nowrap">{STATUS_LABELS[r.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
