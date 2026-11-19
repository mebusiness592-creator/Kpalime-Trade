'use client';

import { useEffect, useState } from 'react';
import { ACCOUNT_TYPES } from '@/lib/roles';

interface Me { name: string; email: string; phone?: string; role: string }
const field = 'w-full rounded-md bg-night border border-white/10 px-3 py-2 text-sm text-white';

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [f, setF] = useState({ name: '', phone: '', currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  useEffect(() => { fetch('/api/auth/me').then((r) => r.json()).then((r) => { if (r.user) { setMe(r.user); setF((x) => ({ ...x, name: r.user.name, phone: r.user.phone ?? '' })); } }); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, string> = { name: f.name, phone: f.phone };
    if (f.newPassword) { body.currentPassword = f.currentPassword; body.newPassword = f.newPassword; }
    const r = await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((x) => x.json());
    setMsg({ ok: r.success, t: r.success ? 'Profil mis à jour' : r.error });
    if (r.success) setF((x) => ({ ...x, currentPassword: '', newPassword: '' }));
  }
  if (!me) return <p className="text-sm text-muted">Chargement…</p>;
  return (
    <form onSubmit={save} className="space-y-5 max-w-lg">
      <h1 className="text-2xl font-bold text-white">Mon profil</h1>
      <p className="text-sm text-muted">{me.email} · {ACCOUNT_TYPES.find((a) => a.value === me.role)?.label ?? me.role}</p>
      {msg && <p className={`rounded-md text-sm p-3 ${msg.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{msg.t}</p>}
      <div className="rounded-xl border border-white/10 bg-night-light p-5 space-y-3">
        <label className="block text-sm text-white">Nom<input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
        <label className="block text-sm text-white">Téléphone<input className={field} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <p className="text-sm font-medium text-white pt-2">Changer le mot de passe (optionnel)</p>
        <input className={field} type="password" placeholder="Mot de passe actuel" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
        <input className={field} type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} />
      </div>
      <button className="px-5 py-2.5 rounded-md bg-emerald-brand text-white text-sm font-semibold">Enregistrer</button>
    </form>
  );
}
