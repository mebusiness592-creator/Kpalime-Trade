'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { STATUS_LABELS, SUBJECT_LABELS } from '@/lib/support-labels';

interface Row { _id: string; reference: string; title: string; subject: string; status: string; updatedAt: string; userId?: { name: string; email: string; role: string } }

export default function AdminSupportPage() {
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/support?status=${status}`).then((r) => r.json()).then((r) => { if (r.success) setRows(r.data); setLoading(false); });
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Assistance & messagerie</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm bg-black/30 text-gray-200 rounded p-2">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Chargement…</p> : rows.length === 0 ? <p className="text-gray-400 text-sm">Aucune demande.</p> : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-white/5 text-left text-xs uppercase text-gray-400">
              <tr><th className="p-3">Réf.</th><th className="p-3">Utilisateur</th><th className="p-3">Sujet</th><th className="p-3">Statut</th><th className="p-3">Mise à jour</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-3"><Link href={`/admin/support/${r._id}`} className="text-emerald-300 hover:underline">{r.reference}</Link></td>
                  <td className="p-3">{r.userId?.name}<br /><span className="text-xs text-gray-500">{r.userId?.email}</span></td>
                  <td className="p-3">{SUBJECT_LABELS[r.subject]}<br /><span className="text-xs text-gray-500">{r.title}</span></td>
                  <td className="p-3">{STATUS_LABELS[r.status]}</td>
                  <td className="p-3">{new Date(r.updatedAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
