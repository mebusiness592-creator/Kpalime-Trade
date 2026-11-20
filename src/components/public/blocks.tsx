import Link from 'next/link';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';

/** En-tête de page avec image de fond (administrable) et texte par-dessus. */
export function PageHero({ title, subtitle, image, children }: { title: string; subtitle?: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10">
      {image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={image} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover" /> : <div className="absolute inset-0 -z-10 bg-gradient-to-br from-night-light via-night to-emerald-brand/20" />}
      <div className={image ? 'bg-black/60' : ''}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-3 text-white/80 max-w-2xl">{subtitle}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** Recherche + filtre par catégorie, en GET (fonctionne sans JavaScript). */
export function SearchBar({ action, q, category, placeholder }: { action: string; q?: string; category?: string; placeholder: string }) {
  return (
    <form action={action} method="GET" className="flex gap-2 max-w-xl">
      {category && <input type="hidden" name="category" value={category} />}
      <input name="q" defaultValue={q} placeholder={placeholder} className="flex-1 rounded-md bg-night/90 border border-white/15 px-4 py-3 text-sm text-white placeholder-muted focus:border-emerald-brand focus:outline-none" />
      <button className="px-5 rounded-md bg-gold text-night font-semibold hover:bg-gold-light">Rechercher</button>
    </form>
  );
}

export function CategoryChips({ base, items, active, q }: { base: string; items: { value: string; label: string; count?: number }[]; active?: string; q?: string }) {
  const href = (c?: string) => { const p = new URLSearchParams(); if (c) p.set('category', c); if (q) p.set('q', q); const s = p.toString(); return s ? `${base}?${s}` : base; };
  const cls = (on: boolean) => `px-4 py-2 rounded-full text-sm border transition-colors ${on ? 'bg-emerald-brand border-emerald-brand text-white' : 'border-white/15 text-muted hover:text-white hover:border-white/40'}`;
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={href()} className={cls(!active)}>Tout</Link>
      {items.map((c) => <Link key={c.value} href={href(c.value)} className={cls(active === c.value)}>{c.label}{c.count !== undefined ? ` (${c.count})` : ''}</Link>)}
    </div>
  );
}

export function EntityCard({ href, image, title, subtitle, badge, text, footer }: { href: string; image?: string; title: string; subtitle?: string; badge?: string; text?: string; footer?: string }) {
  return (
    <Link href={href} className="group rounded-xl overflow-hidden border border-white/10 bg-night-light hover:border-emerald-brand/50 hover:-translate-y-0.5 transition-all flex flex-col">
      <div className="relative aspect-[4/3] bg-night overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image || PLACEHOLDER_IMG} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {badge && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-night/85 text-gold backdrop-blur">{badge}</span>}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <h3 className="font-semibold text-white group-hover:text-gold line-clamp-1">{title}</h3>
        {subtitle && <p className="text-xs text-muted line-clamp-1">{subtitle}</p>}
        {text && <p className="text-sm text-white/70 line-clamp-2">{text}</p>}
        {footer && <p className="text-sm text-gold mt-auto pt-2">{footer}</p>}
      </div>
    </Link>
  );
}

export function Empty({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 p-12 text-center space-y-3">
      <p className="text-muted">{text}</p>
      {cta && <Link href={cta.href} className="inline-block px-5 py-2.5 rounded-md bg-emerald-brand text-white font-semibold hover:bg-emerald-light">{cta.label}</Link>}
    </div>
  );
}

export function ContactButtons({ phone, whatsapp, email }: { phone?: string; whatsapp?: string; email?: string }) {
  const clean = (s: string) => s.replace(/[^\d+]/g, '');
  return (
    <div className="flex flex-wrap gap-2">
      {phone && <a href={`tel:${clean(phone)}`} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm hover:bg-white/20">📞 {phone}</a>}
      {whatsapp && <a href={`https://wa.me/${clean(whatsapp).replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-emerald-brand text-white text-sm hover:bg-emerald-light">WhatsApp</a>}
      {email && <a href={`mailto:${email}`} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm hover:bg-white/20">✉ {email}</a>}
    </div>
  );
}

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {images.map((u, i) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u + i} src={u} alt={`${alt} ${i + 1}`} loading="lazy" className={`w-full object-cover rounded-lg ${i === 0 ? 'col-span-2 row-span-2 h-full min-h-[16rem]' : 'h-40'}`} />)}
    </div>
  );
}

export function Pager({ base, page, pages, params }: { base: string; page: number; pages: number; params: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (n: number) => { const p = new URLSearchParams({ ...params, page: String(n) }); return `${base}?${p}`; };
  return (
    <div className="flex items-center justify-center gap-3 pt-4 text-sm">
      {page > 1 ? <Link href={href(page - 1)} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20">← Précédent</Link> : <span />}
      <span className="text-muted">Page {page} / {pages}</span>
      {page < pages ? <Link href={href(page + 1)} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20">Suivant →</Link> : <span />}
    </div>
  );
}
