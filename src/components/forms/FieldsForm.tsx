'use client';

import { useEffect, useState } from 'react';
import type { FieldDef } from '@/lib/listing-config';
import { ImageField, type GalleryImage } from '@/components/dashboard/ImageField';

export type Values = Record<string, unknown>;
const input = 'w-full rounded-md bg-night border border-white/10 px-3 py-2 text-sm text-white placeholder-muted focus:border-emerald-brand focus:outline-none';

const toDateInput = (v: unknown) => (v ? String(v).slice(0, 10) : '');

/** Génère les champs d'un formulaire à partir d'une définition (utilisé par l'espace pro ET l'admin). */
export function FieldsForm({ fields, values, onChange }: { fields: FieldDef[]; values: Values; onChange: (v: Values) => void }) {
  const [dyn, setDyn] = useState<Record<string, { value: string; label: string }[]>>({});
  useEffect(() => {
    const kinds = Array.from(new Set(fields.filter((f) => f.taxonomy).map((f) => f.taxonomy as string)));
    kinds.forEach((k) => fetch(`/api/taxonomies?kind=${k}`).then((r) => r.json()).then((r) => r.success && setDyn((d) => ({ ...d, [k]: r.data })))); 
  }, [fields]);
  const set = (name: string, val: unknown) => onChange({ ...values, [name]: val });
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className={f.col === 2 || f.type === 'gallery' ? 'sm:col-span-2' : ''}>
          {f.type !== 'boolean' && <label className="block text-sm font-medium text-white mb-1">{f.label}{f.required && <span className="text-gold"> *</span>}</label>}
          {f.type === 'textarea' ? (
            <textarea rows={5} className={input} value={(values[f.name] as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />
          ) : f.type === 'select' ? (
            <select className={input} value={(values[f.name] as string) ?? ''} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">— Choisir —</option>
              {(f.taxonomy ? (dyn[f.taxonomy] ?? f.options ?? []) : f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              {f.taxonomy && !(dyn[f.taxonomy] ?? f.options)?.length && <option value="" disabled>Aucune catégorie : demandez à l’administration d’en créer</option>}
            </select>
          ) : f.type === 'image' || f.type === 'gallery' ? (
            <ImageField multiple={f.type === 'gallery'} value={values[f.name] as string | GalleryImage[] | undefined} onChange={(x) => set(f.name, x)} />
          ) : f.type === 'boolean' ? (
            <label className="flex items-center gap-2 text-sm text-white pt-6"><input type="checkbox" checked={values[f.name] === true} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}</label>
          ) : f.type === 'date' ? (
            <input className={input} type="date" value={toDateInput(values[f.name])} onChange={(e) => set(f.name, e.target.value)} />
          ) : (
            <input className={input} type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'} step={f.type === 'number' ? 'any' : undefined}
              value={(values[f.name] as string | number) ?? ''} onChange={(e) => set(f.name, e.target.value)} />
          )}
          {f.help && <p className="text-xs text-muted mt-1">{f.help}</p>}
        </div>
      ))}
    </div>
  );
}

/** Prépare les valeurs initiales d'édition (tags → texte). */
export function toFormValues(fields: FieldDef[], doc?: Values): Values {
  const base: Values = { ...(doc || {}) };
  for (const f of fields) if (f.type === 'tags' && Array.isArray(base[f.name])) base[f.name] = (base[f.name] as string[]).join(', ');
  return base;
}
