'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/upload-client';

export interface GalleryImage { secure_url: string; public_id: string }

/** Envoi direct vers Cloudinary ; ne conserve que l'URL et l'identifiant dans la base. */
export function ImageField({ multiple, value, onChange }: { multiple: boolean; value: string | GalleryImage[] | undefined; onChange: (v: string | GalleryImage[] | undefined) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list: GalleryImage[] = multiple ? ((value as GalleryImage[]) || []) : [];
  const single = !multiple ? (value as string | undefined) : undefined;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError('');
    try {
      const ups = [];
      for (const f of Array.from(files).slice(0, multiple ? 10 : 1)) ups.push(await uploadImage(f));
      if (multiple) onChange([...list, ...ups.map((u) => ({ secure_url: u.url, public_id: u.publicId }))]);
      else onChange(ups[0].url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur d’envoi'); }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {multiple ? list.map((img, i) => (
          <div key={img.public_id || i} className="relative w-24 h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.secure_url} alt="" className="w-full h-full object-cover rounded-md" />
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs">×</button>
          </div>
        )) : single && (
          <div className="relative w-24 h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={single} alt="" className="w-full h-full object-cover rounded-md" />
            <button type="button" onClick={() => onChange(undefined)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs">×</button>
          </div>
        )}
        <label className="w-24 h-24 rounded-md border border-dashed border-white/30 flex items-center justify-center text-xs text-muted cursor-pointer hover:bg-white/5 text-center">
          {busy ? 'Envoi…' : '+ Ajouter'}
          <input type="file" accept="image/*" multiple={multiple} className="hidden" disabled={busy} onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
