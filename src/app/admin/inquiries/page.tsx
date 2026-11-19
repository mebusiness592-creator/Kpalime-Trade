'use client';

import { useEffect, useState } from 'react';

interface Row { _id: string; reference: string; kind: string; targetType: string; targetName: string; name: string; email: string; status: string; createdAt: string; recipientId?: { name: string; email: string } }

export default function AdminInquiriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { fetch('/api/admin/inquiries').then((r) => r.json()).then((r) => r.success && setRows(r.data)); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Demandes commerciales</h1>
      <p className="text-sm text-gray-400">Vue de supervision : demandes de renseignements, devis et réservations envoyées aux professionnels.</p>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm text-gray-200">
          <thead className="bg-white/5 text-left text-xs uppercase text-gray-400"><tr><th className="p-3">Réf.</th><th className="p-3">Type</th><th className="p-3">Fiche</th><th className="p-3">Demandeur</th><th className="p-3">Destinataire</th><th className="p-3">Statut</th><th className="p-3">Date</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r._id} className="border-t border-white/5">
              <td className="p-3">{r.reference}</td><td className="p-3">{r.kind} / {r.targetType}</td><td className="p-3">{r.targetName}</td>
              <td className="p-3">{r.name}<br /><span className="text-xs text-gray-500">{r.email}</span></td>
              <td className="p-3">{r.recipientId?.name}</td><td className="p-3">{r.status}</td><td className="p-3">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>))}
            {rows.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-500">Aucune demande.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
