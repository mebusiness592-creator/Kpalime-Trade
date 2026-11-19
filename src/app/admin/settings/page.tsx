'use client';

import { useEffect, useState } from 'react';
import { ImageField } from '@/components/dashboard/ImageField';
import { DEFAULT_SETTINGS, THEME_PRESETS, type SiteSettings } from '@/lib/site-config';

const COLORS: [keyof SiteSettings, string][] = [['colorNight', 'Fond principal'], ['colorNightLight', 'Fond des cartes'], ['colorAccent', 'Couleur principale (boutons)'], ['colorAccentLight', 'Couleur principale (survol)'], ['colorGold', 'Couleur d’accent (or)']];
const TEXTS: [keyof SiteSettings, string][] = [['brandName', 'Nom de la plateforme'], ['tagline', 'Slogan'], ['email', 'E-mail de contact'], ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp (avec indicatif)'], ['address', 'Adresse'], ['facebook', 'Facebook (lien)'], ['instagram', 'Instagram (lien)'], ['twitter', 'X / Twitter (lien)'], ['youtube', 'YouTube (lien)']];
const field = 'w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white';

export default function AdminSettingsPage() {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/admin/site-config').then((r) => r.json()).then((r) => r.success && setS(r.data)); }, []);
  const up = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    const r = await fetch('/api/admin/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }).then((x) => x.json());
    setSaving(false); setMsg({ ok: r.success, t: r.success ? 'Paramètres enregistrés. Le site se met à jour en moins d’une minute.' : r.error });
  }
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold text-white">Thème & paramètres du site</h1><p className="text-sm text-gray-400">Identité, couleurs de l’interface, coordonnées et réseaux sociaux.</p></div>
      {msg && <p className={`rounded-md text-sm p-3 ${msg.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{msg.t}</p>}

      <section className="rounded-lg border border-white/10 p-4 space-y-4">
        <h2 className="font-semibold text-white">Thème de l’interface</h2>
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((p) => (
            <button key={p.name} onClick={() => setS((x) => ({ ...x, ...p.colors }))} className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 text-sm text-gray-200 hover:bg-white/20">
              <span className="flex">{Object.values(p.colors).map((c) => <i key={c} style={{ background: c }} className="w-4 h-4 first:rounded-l last:rounded-r" />)}</span>{p.name}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLORS.map(([k, l]) => (
            <label key={k} className="text-sm text-gray-300 space-y-1 block">{l}
              <div className="flex gap-2"><input type="color" value={s[k]} onChange={(e) => up(k, e.target.value)} className="h-9 w-12 rounded bg-transparent" /><input className={field} value={s[k]} onChange={(e) => up(k, e.target.value)} /></div>
            </label>
          ))}
        </div>
        <div className="rounded-lg p-4 text-white" style={{ background: s.colorNight }}>
          <div className="rounded-md p-3 mb-3" style={{ background: s.colorNightLight }}>Aperçu d’une carte</div>
          <span className="inline-block px-4 py-2 rounded-md mr-2" style={{ background: s.colorAccent }}>Bouton principal</span>
          <span className="inline-block px-4 py-2 rounded-md text-black" style={{ background: s.colorGold }}>Accent</span>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 p-4 space-y-3">
        <h2 className="font-semibold text-white">Identité & coordonnées</h2>
        <div><p className="text-sm text-gray-300 mb-1">Logo</p><ImageField multiple={false} value={s.logoUrl || undefined} onChange={(v) => up('logoUrl', (v as string) || '')} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          {TEXTS.map(([k, l]) => <label key={k} className="text-sm text-gray-300 block space-y-1">{l}<input className={field} value={s[k]} onChange={(e) => up(k, e.target.value)} /></label>)}
        </div>
        <label className="text-sm text-gray-300 block space-y-1">Texte du pied de page<textarea rows={3} className={field} value={s.footerText} onChange={(e) => up('footerText', e.target.value)} /></label>
        <label className="text-sm text-gray-300 block space-y-1">Bandeau d’annonce (affiché en haut du site, vide = aucun)<input className={field} value={s.announcement} onChange={(e) => up('announcement', e.target.value)} /></label>
      </section>
      <button disabled={saving} onClick={save} className="px-6 py-2.5 rounded-md bg-emerald-600 text-white font-semibold disabled:opacity-50">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
    </div>
  );
}
