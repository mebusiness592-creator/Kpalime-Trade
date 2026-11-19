'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { uploadImage } from '@/lib/upload-client';

interface Slot { key: string; label: string; group: string; fallback: string; current: string | null; alt: string; custom: boolean }
interface Asset { _id: string; url: string; publicId: string; label?: string }

export default function AdminImagesPage() {
  const [tab, setTab] = useState<'slots' | 'library' | 'custom'>('slots');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [custom, setCustom] = useState({ key: '', label: '', group: '' });

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([fetch('/api/admin/site-images').then((r) => r.json()), fetch('/api/admin/media').then((r) => r.json())]);
    if (a.success) setSlots(a.data);
    if (b.success) setAssets(b.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const notify = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 5000); };
  const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

  async function setSlot(slot: Pick<Slot, 'key' | 'label' | 'group' | 'custom'>, src: { file?: File; url?: string }) {
    setBusy(slot.key);
    try {
      let url = src.url, publicId: string | undefined;
      if (src.file) { const up = await uploadImage(src.file, 'site'); url = up.url; publicId = up.publicId; }
      const r = await post('/api/admin/site-images', { key: slot.key, url, publicId, custom: slot.custom, label: slot.label, group: slot.group });
      notify(r.success, r.success ? 'Image enregistrée sur Cloudinary et appliquée' : r.error);
      if (r.success) load();
    } catch (e) { notify(false, e instanceof Error ? e.message : 'Erreur'); }
    setBusy(null);
  }
  async function resetSlot(key: string) {
    if (!confirm('Retirer cette image (retour à l’image par défaut) ?')) return;
    await fetch(`/api/admin/site-images?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    load();
  }
  async function uploadAsset(files: FileList) {
    setBusy('library');
    try {
      for (const f of Array.from(files)) {
        const up = await uploadImage(f, 'media');
        await post('/api/admin/media', { url: up.url, publicId: up.publicId, folder: 'media', label: f.name });
      }
      notify(true, 'Image(s) ajoutée(s) à la médiathèque'); load();
    } catch (e) { notify(false, e instanceof Error ? e.message : 'Erreur'); }
    setBusy(null);
  }
  async function deleteAsset(id: string) {
    if (!confirm('Supprimer définitivement cette image de Cloudinary ?')) return;
    await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' }); load();
  }

  const filtered = useMemo(() => slots.filter((s) => !q || `${s.label} ${s.group} ${s.key}`.toLowerCase().includes(q.toLowerCase())), [slots, q]);
  const groups = useMemo(() => Array.from(new Set(filtered.map((s) => s.group))), [filtered]);
  const done = slots.filter((s) => s.current).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Images du site</h1>
        <p className="text-sm text-gray-400">Toutes les images sont stockées sur Cloudinary et appliquées sur le site en moins d’une minute. {done}/{slots.length} emplacements personnalisés.</p>
      </div>
      {msg && <div className={`p-3 rounded-md text-sm ${msg.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{msg.text}</div>}

      <div className="flex flex-wrap gap-2">
        {([['slots', 'Emplacements'], ['library', `Médiathèque (${assets.length})`], ['custom', 'Nouvel emplacement']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-300'}`}>{l}</button>
        ))}
        {tab === 'slots' && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un emplacement…" className="ml-auto rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white" />}
      </div>

      {tab === 'slots' && groups.map((g) => {
        const items = filtered.filter((s) => s.group === g);
        const isOpen = open[g] ?? (!!q || groups.length <= 3);
        return (
          <section key={g} className="rounded-lg border border-white/10">
            <button onClick={() => setOpen((o) => ({ ...o, [g]: !isOpen }))} className="w-full flex justify-between px-4 py-3 text-left text-white font-semibold">
              <span>{g} <span className="text-xs text-gray-400 font-normal">({items.filter((i) => i.current).length}/{items.length})</span></span><span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                {items.map((s) => {
                  const shown = s.current || s.fallback;
                  return (
                    <div key={s.key} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                      <p className="text-sm font-medium text-white">{s.label}</p>
                      <div className="aspect-video rounded bg-black/30 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {shown ? <img src={shown} alt={s.label} className="w-full h-full object-cover" /> : 'Aucune image'}
                      </div>
                      <label className="block">
                        <span className="inline-block cursor-pointer px-3 py-1.5 rounded bg-emerald-600 text-white text-xs">{busy === s.key ? 'Envoi…' : s.current ? 'Remplacer' : 'Téléverser'}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={busy === s.key} onChange={(e) => { const f = e.target.files?.[0]; if (f) setSlot(s, { file: f }); e.target.value = ''; }} />
                      </label>
                      {assets.length > 0 && (
                        <select className="w-full text-xs bg-black/30 text-gray-300 rounded p-1.5" defaultValue="" onChange={(e) => { if (e.target.value) setSlot(s, { url: e.target.value }); e.target.value = ''; }}>
                          <option value="">Choisir dans la médiathèque…</option>
                          {assets.map((a) => <option key={a._id} value={a.url}>{a.label || a.url.split('/').pop()}</option>)}
                        </select>
                      )}
                      {s.current && <button onClick={() => resetSlot(s.key)} className="text-xs text-red-300 hover:underline">Retirer l’image</button>}
                      <p className="text-[10px] text-gray-500 break-all">{s.key}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {tab === 'library' && (
        <section className="space-y-4">
          <label className="inline-block cursor-pointer px-4 py-2 rounded-md bg-emerald-600 text-white text-sm">
            {busy === 'library' ? 'Envoi…' : 'Ajouter des images'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) uploadAsset(e.target.files); e.target.value = ''; }} />
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {assets.map((a) => (
              <div key={a._id} className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.label || ''} className="aspect-square w-full object-cover rounded" />
                <div className="flex justify-between text-xs">
                  <button onClick={() => { navigator.clipboard.writeText(a.url); notify(true, 'Lien copié'); }} className="text-emerald-300 hover:underline">Copier le lien</button>
                  <button onClick={() => deleteAsset(a._id)} className="text-red-300 hover:underline">Supprimer</button>
                </div>
              </div>
            ))}
            {assets.length === 0 && <p className="text-sm text-gray-400 col-span-full">Aucune image pour le moment.</p>}
          </div>
        </section>
      )}

      {tab === 'custom' && (
        <section className="max-w-lg space-y-3 rounded-lg border border-white/10 p-4">
          <p className="text-sm text-gray-300">Créez un emplacement libre (ex. image d’un partenaire). Il pourra être affiché partout avec la clé indiquée.</p>
          <input value={custom.label} onChange={(e) => setCustom({ ...custom, label: e.target.value })} placeholder="Nom (ex. Partenaire – Café de Kpalimé)" className="w-full rounded-md bg-black/30 border border-white/10 p-2 text-sm text-white" />
          <input value={custom.key} onChange={(e) => setCustom({ ...custom, key: e.target.value.toLowerCase() })} placeholder="Clé (ex. partner.cafe-kpalime)" className="w-full rounded-md bg-black/30 border border-white/10 p-2 text-sm text-white" />
          <input value={custom.group} onChange={(e) => setCustom({ ...custom, group: e.target.value })} placeholder="Groupe (ex. Partenaires)" className="w-full rounded-md bg-black/30 border border-white/10 p-2 text-sm text-white" />
          <label className="inline-block cursor-pointer px-4 py-2 rounded-md bg-emerald-600 text-white text-sm">
            {busy === custom.key ? 'Envoi…' : 'Choisir l’image et créer'}
            <input type="file" accept="image/*" className="hidden" disabled={!custom.key || !custom.label}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setSlot({ key: custom.key, label: custom.label, group: custom.group || 'Emplacements personnalisés', custom: true }, { file: f }).then(() => setCustom({ key: '', label: '', group: '' })); e.target.value = ''; }} />
          </label>
        </section>
      )}
    </div>
  );
}
