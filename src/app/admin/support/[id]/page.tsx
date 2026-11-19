'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TicketThread, type ThreadMessage } from '@/components/support/TicketThread';
import { STATUS_LABELS, SUBJECT_LABELS } from '@/lib/support-labels';

interface Ticket { _id: string; reference: string; title: string; subject: string; status: string; messages: ThreadMessage[]; userId?: { name: string; email: string; phone?: string; role: string } }

export default function AdminTicketPage() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<Ticket | null>(null);
  const load = useCallback(() => { fetch(`/api/admin/support/${id}`).then((r) => r.json()).then((r) => r.success && setT(r.data)); }, [id]);
  useEffect(() => { load(); }, [load]);
  if (!t) return <p className="text-gray-400 text-sm">Chargement…</p>;
  return (
    <div className="space-y-4">
      <Link href="/admin/support" className="text-sm text-emerald-300 hover:underline">← Toutes les demandes</Link>
      <div>
        <h1 className="text-xl font-bold text-white">{t.reference} · {t.title}</h1>
        <p className="text-sm text-gray-400">{SUBJECT_LABELS[t.subject]} · {STATUS_LABELS[t.status]} · {t.userId?.name} ({t.userId?.email}{t.userId?.phone ? `, ${t.userId.phone}` : ''}) · {t.userId?.role}</p>
      </div>
      <TicketThread ticketId={t._id} messages={t.messages} status={t.status} mode="admin" onChanged={load} />
    </div>
  );
}
