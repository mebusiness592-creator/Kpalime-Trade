'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function FavoriteButton({ targetType, targetId, name, path, image }: { targetType: string; targetId: string; name: string; path: string; image?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (user) fetch(`/api/favorites?targetId=${targetId}`).then((r) => r.json()).then((r) => r.success && setSaved(r.data.saved)); }, [user, targetId]);
  async function toggle() {
    if (!user) return router.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
    const r = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, name, path, image }) }).then((x) => x.json());
    if (r.success) setSaved(r.data.saved);
  }
  return <button onClick={toggle} aria-pressed={saved} className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm border ${saved ? 'bg-red-500/20 border-red-400/40 text-red-200' : 'border-white/20 text-white hover:bg-white/10'}`}>{saved ? '❤ Enregistré' : '♡ Ajouter aux favoris'}</button>;
}
