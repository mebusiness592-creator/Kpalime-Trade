'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Slide {
  _id: string; imageUrl?: string; eyebrow?: string; title: string; subtitle?: string;
  ctaLabel?: string; ctaHref?: string; cta2Label?: string; cta2Href?: string; overlay?: number; align?: 'left' | 'center';
}

const safeHref = (h?: string) => (h && (h.startsWith('/') || /^https?:\/\//.test(h)) ? h : '/');

/** Bannière d'accueil : image en arrière-plan, texte par-dessus, défilement automatique. */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  return (
    <section className="relative isolate overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
      {slides.map((s, idx) => (
        <div key={s._id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden={idx !== i}>
          {s.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading={idx === 0 ? 'eager' : 'lazy'} />
          ) : <div className="absolute inset-0 bg-gradient-to-br from-night via-night-light to-emerald-brand/30" />}
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,${((s.overlay ?? 55) + 10) / 100}) 0%, rgba(0,0,0,${(s.overlay ?? 55) / 100}) 55%, rgba(0,0,0,${Math.max((s.overlay ?? 55) - 20, 0) / 100}) 100%)` }} />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent" />
          <div className={`relative z-10 h-full max-w-7xl mx-auto px-4 flex items-center ${s.align === 'center' ? 'justify-center text-center' : ''}`}>
            <div className={`max-w-2xl py-20 ${idx === i ? 'animate-fade-in' : ''}`}>
              {s.eyebrow && <p className="inline-block px-3 py-1 rounded-md border border-gold/40 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider mb-5">{s.eyebrow}</p>}
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">{s.title}</h1>
              {s.subtitle && <p className="mt-5 text-base md:text-lg text-white/85 leading-relaxed">{s.subtitle}</p>}
              <div className={`mt-8 flex flex-wrap gap-3 ${s.align === 'center' ? 'justify-center' : ''}`}>
                {s.ctaLabel && <Link href={safeHref(s.ctaHref)} className="touch-target px-6 py-3 rounded-md bg-emerald-brand text-white font-semibold hover:bg-emerald-light transition-colors">{s.ctaLabel}</Link>}
                {s.cta2Label && <Link href={safeHref(s.cta2Href)} className="touch-target px-6 py-3 rounded-md bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors backdrop-blur">{s.cta2Label}</Link>}
              </div>
            </div>
          </div>
        </div>
      ))}

      <form action="/search" method="GET" className="absolute z-20 left-1/2 -translate-x-1/2 bottom-6 w-[92%] max-w-3xl flex gap-2">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input name="q" placeholder="Rechercher un produit, un fournisseur, un hôtel, un service…" className="w-full pl-12 pr-4 py-3.5 rounded-md bg-night/90 backdrop-blur border border-white/15 text-white placeholder-muted text-sm focus:border-emerald-brand focus:outline-none" />
        </div>
        <button className="touch-target px-5 rounded-md bg-gold text-night font-semibold hover:bg-gold-light" aria-label="Rechercher"><Search size={20} /></button>
      </form>

      {slides.length > 1 && (
        <>
          <button onClick={() => setI((i - 1 + slides.length) % slides.length)} className="hidden md:flex absolute z-20 left-3 top-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Précédent"><ChevronLeft /></button>
          <button onClick={() => setI((i + 1) % slides.length)} className="hidden md:flex absolute z-20 right-3 top-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Suivant"><ChevronRight /></button>
          <div className="absolute z-20 bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((s, idx) => <button key={s._id} onClick={() => setI(idx)} aria-label={`Diapositive ${idx + 1}`} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-gold' : 'w-2 bg-white/50'}`} />)}
          </div>
        </>
      )}
    </section>
  );
}
