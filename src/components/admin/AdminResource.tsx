'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_RESOURCES, type AdminAction, type Col } from '@/lib/admin-config';
import { FieldsForm, toFormValues, type Values } from '@/components/forms/FieldsForm';

type Row = Record<string, unknown> & { _id: string };

const get = (row: Row, path: string): unknown => path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), row);
const TONE: Record<string, string> = { good: 'bg-emerald-600 text-white', bad: 'bg-red-600/80 text-white', warn: 'bg-orange-500/80 text-white', neutral: 'bg-white/10 text-gray-200' };

const HIDDEN = new Set(['__v', 'password']);
const prettify = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function Val({ v }: { v: unknown }): React.ReactNode {
  if (v === null || v === undefined || v === '') return <span className="text-gray-600">—</span>;
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  if (typeof v === 'string' && /^https:\/\/res\.cloudinary\.com\//.test(v)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <a href={v} target="_blank" rel="noopener noreferrer"><img src={v} alt="" className="h-24 rounded" /></a>;
  }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString('fr-FR');
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-gray-600">—</span>;
    if (v.every((x) => x && typeof x === 'object' && 'secure_url' in x)) return <div className="flex flex-wrap gap-2">{v.map((x, i) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={i} src={(x as { secure_url: string }).secure_url} alt="" className="h-24 rounded" />)}</div>;
    if (v.every((x) => typeof x !== 'object')) return v.join(', ');
    return <div className="space-y-1">{v.map((x, i) => <div key={i} className="rounded bg-white/5 p-2"><Val v={x} /></div>)}</div>;
  }
  if (typeof v === 'object') return <div className="space-y-1 pl-3 border-l border-white/10">{Object.entries(v as Record<string, unknown>).filter(([k]) => !HIDDEN.has(k)).map(([k, x]) => <div key={k}><span className="text-gray-400">{prettify(k)} : </span><Val v={x} /></div>)}</div>;
  return String(v);
}

/** Fiche complète : tout ce que l'utilisateur a saisi, champ par champ. */
function DetailModal({ row, cfg, onClose }: { row: Row; cfg: (typeof ADMIN_RESOURCES)[string]; onClose: () => void }) {
  const labels = Object.fromEntries((cfg.fields ?? []).map((f) => [f.name, f.label]));
  const entries = Object.entries(row).filter(([k]) => !HIDDEN.has(k));
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 overflow-y-auto p-4" onClick={onClose}>
      <div className="max-w-3xl mx-auto my-6 rounded-xl bg-night-light border border-white/10 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">Détails complets · {cfg.singular}</h3><button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button></div>
        <dl className="divide-y divide-white/5 text-sm">
          {entries.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-3 py-2"><dt className="text-gray-400">{labels[k] ?? prettify(k)}</dt><dd className="col-span-2 text-gray-100 break-words"><Val v={v} /></dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function AdminResource({ resource }: { resource: string }) {
  const cfg = ADMIN_RESOURCES[resource];
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [note, setNote] = useState<{ row: Row; action: AdminAction } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [form, setForm] = useState<{ id?: string; values: Values } | null>(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const base = `/api/admin/resources/${resource}`;

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ q, status, page: String(page) });
    const r = await fetch(`${base}?${p}`).then((x) => x.json()).catch(() => null);
    if (r?.success) { setRows(r.data); setTotal(r.total); setPages(r.pages); }
    setLoading(false);
  }, [base, q, status, page]);
  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { setPage(1); }, [q, status]);

  const notify = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 5000); };

  async function run(row: Row, action: AdminAction, extra: { note?: string; value?: string } = {}) {
    const r = await fetch(`${base}/${row._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: action.key, ...extra }) }).then((x) => x.json());
    notify(r.success, r.success ? 'Action effectuée' : r.error);
    if (r.success) load();
  }
  function click(row: Row, a: AdminAction) {
    if (a.needsNote) { setNote({ row, action: a }); setNoteText(''); return; }
    if (a.confirm && !confirm(a.confirm)) return;
    run(row, a);
  }
  async function remove(row: Row) {
    if (!confirm('Supprimer définitivement cet élément ?')) return;
    const r = await fetch(`${base}/${row._id}`, { method: 'DELETE' }).then((x) => x.json());
    notify(r.success, r.success ? 'Élément supprimé' : r.error);
    if (r.success) load();
  }
  async function save() {
    if (!form) return;
    setSaving(true);
    const r = await fetch(form.id ? `${base}/${form.id}` : base, { method: form.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form.values) }).then((x) => x.json()).catch(() => ({ success: false, error: 'Erreur réseau' }));
    setSaving(false);
    notify(r.success, r.success ? 'Enregistré' : r.error);
    if (r.success) { setForm(null); load(); }
  }

  if (!cfg) return <p className="text-gray-400">Menu inconnu.</p>;

  const cell = (row: Row, c: Col) => {
    const v = get(row, c.key);
    switch (c.kind) {
      case 'bool': return v ? <span className="text-emerald-400">Oui</span> : <span className="text-gray-500">Non</span>;
      case 'date': return v ? new Date(String(v)).toLocaleDateString('fr-FR') : '—';
      case 'money': return typeof v === 'number' ? `${v.toLocaleString('fr-FR')} FCFA` : '—';
      case 'list': return Array.isArray(v) ? v.join(', ') : '—';
      case 'image': { const u = typeof v === 'string' ? v : Array.isArray(v) ? (v[0] as { secure_url?: string })?.secure_url : undefined;
        // eslint-disable-next-line @next/next/no-img-element
        return u ? <img src={u} alt="" className="w-10 h-10 object-cover rounded" /> : <span className="text-gray-600">—</span>; }
      case 'badge': { const s = cfg.statuses?.find((x) => x.value === v); return <span className={`px-2 py-0.5 rounded-full text-xs ${s?.cls || 'bg-white/10 text-gray-300'}`}>{s?.label || String(v ?? '—')}</span>; }
      default: { const t = v == null ? '—' : String(v); return t.length > 70 ? `${t.slice(0, 70)}…` : t; }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{cfg.label}</h1>
          {cfg.description && <p className="text-sm text-gray-400">{cfg.description}</p>}
          <p className="text-xs text-gray-500">{total} élément(s)</p>
        </div>
        {cfg.canCreate && cfg.fields && <button onClick={() => setForm({ values: {} })} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold">+ Nouveau</button>}
      </div>

      {msg && <div className={`p-3 rounded-md text-sm ${msg.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{msg.text}</div>}

      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white" />
        {cfg.statuses && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white">
            <option value="all">Tous</option>{cfg.statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm text-gray-200">
          <thead className="bg-white/5 text-left text-xs uppercase text-gray-400"><tr>{cfg.columns.map((c) => <th key={c.key} className="p-3 whitespace-nowrap">{c.label}</th>)}<th className="p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-t border-white/5 align-top hover:bg-white/[0.03]">
                {cfg.columns.map((c) => <td key={c.key} className="p-3">{cell(row, c)}</td>)}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {cfg.actions.filter((a) => !a.show || a.show(row)).map((a) => a.options ? (
                      <select key={a.key} defaultValue="" onChange={(e) => { if (e.target.value && confirm(`${a.label} : confirmer ?`)) run(row, a, { value: e.target.value }); e.target.value = ''; }} className="text-xs rounded bg-black/40 text-gray-200 px-2 py-1">
                        <option value="">{a.label}…</option>{a.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : <button key={a.key} onClick={() => click(row, a)} className={`px-2 py-1 rounded text-xs ${TONE[a.tone || 'neutral']}`}>{a.label}</button>)}
                    <button onClick={() => setDetail(row)} className="px-2 py-1 rounded text-xs bg-white/15 text-white">Détails</button>
                    {cfg.fields && <button onClick={() => setForm({ id: row._id, values: toFormValues(cfg.fields!, row) })} className="px-2 py-1 rounded text-xs bg-blue-600/70 text-white">Modifier</button>}
                    {cfg.publicPath && typeof row.slug === 'string' && <Link href={`${cfg.publicPath}/${row.slug}`} target="_blank" className="px-2 py-1 rounded text-xs bg-white/10 text-gray-200">Voir</Link>}
                    {cfg.canDelete && <button onClick={() => remove(row)} className="px-2 py-1 rounded text-xs text-red-300 hover:bg-red-500/10">Supprimer</button>}
                  </div>
                  {typeof row.adminNote === 'string' && row.adminNote && <p className="text-[11px] text-orange-300 mt-1 max-w-xs">Note : {row.adminNote}</p>}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={cfg.columns.length + 1} className="p-8 text-center text-gray-500">Aucun élément.</td></tr>}
            {loading && <tr><td colSpan={cfg.columns.length + 1} className="p-8 text-center text-gray-500">Chargement…</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded bg-white/10 disabled:opacity-40">Précédent</button>
          <span>Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded bg-white/10 disabled:opacity-40">Suivant</button>
        </div>
      )}

      {detail && <DetailModal row={detail} cfg={cfg} onClose={() => setDetail(null)} />}

      {note && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-night-light border border-white/10 p-5 space-y-3">
            <h3 className="text-lg font-semibold text-white">{note.action.label}</h3>
            <p className="text-sm text-gray-400">Ce message sera envoyé au professionnel et conservé dans l’historique.</p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="Expliquez la raison / ce qu’il faut corriger…" className="w-full rounded-md bg-night border border-white/10 p-3 text-sm text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setNote(null)} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm">Annuler</button>
              <button disabled={!noteText.trim()} onClick={() => { run(note.row, note.action, { note: noteText }); setNote(null); }} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-50">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {form && cfg.fields && (
        <div className="fixed inset-0 z-[60] bg-black/70 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto my-6 rounded-xl bg-night-light border border-white/10 p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">{form.id ? 'Modifier' : 'Ajouter'} : {cfg.singular}</h3>
            <FieldsForm fields={cfg.fields} values={form.values} onChange={(values) => setForm({ ...form, values })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm">Annuler</button>
              <button disabled={saving} onClick={save} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
