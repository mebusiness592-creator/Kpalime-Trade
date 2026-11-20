import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-config';
import { getTaxonomy } from '@/lib/taxonomy';

const COLUMNS: { title: string; links: readonly (readonly [string, string])[] }[] = [
  { title: 'Marketplace', links: [['/marketplace', 'Tous les produits'], ['/shops', 'Boutiques']] },
  { title: 'Explorer le Togo', links: [['/discover', 'Découvrir les régions'], ['/tourism', 'Sites touristiques'], ['/hotels', 'Hôtels & hébergements'], ['/restaurants', 'Restaurants'], ['/events', 'Événements'], ['/culture', 'Culture & artisans']] },
  { title: 'Entreprises & services', links: [['/services', 'Annuaire des professionnels'], ['/auth/register', 'Inscrire mon entreprise'], ['/auth/register', 'Devenir vendeur'], ['/contact', 'Nous contacter'], ['/about', 'À propos']] },
];

export async function Footer() {
  const s = await getSiteSettings();
  const cats = await getTaxonomy('product');
  const socials = [[s.facebook, 'Facebook', Facebook], [s.instagram, 'Instagram', Instagram], [s.twitter, 'X', Twitter], [s.youtube, 'YouTube', Youtube]] as const;
  return (
    <footer className="bg-night-deep border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            {s.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.logoUrl} alt={s.brandName} className="h-10 w-auto" /> : <div className="w-10 h-10 rounded-md bg-emerald-brand flex items-center justify-center text-white font-bold">KT</div>}
            <span className="font-bold text-xl text-white">{s.brandName}</span>
          </div>
          <p className="text-sm text-gold mb-2">{s.tagline}</p>
          <p className="text-sm text-muted leading-relaxed max-w-md">{s.footerText}</p>
          <div className="flex gap-2 mt-5">
            {socials.filter(([href]) => href).map(([href, label, Icon]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 rounded-md border border-white/10 flex items-center justify-center text-muted hover:bg-emerald-brand hover:text-white transition-colors"><Icon size={16} /></a>
            ))}
          </div>
        </div>
        {COLUMNS.map((c) => c.title === 'Marketplace' ? { ...c, links: [c.links[0], ...cats.slice(0, 4).map((x) => [`/marketplace/categories/${x.slug}`, x.label] as const), ...c.links.slice(1)] } : c).map((c) => (
          <div key={c.title}>
            <h4 className="font-semibold mb-4 text-white">{c.title}</h4>
            <ul className="space-y-2.5">{c.links.map(([href, label]) => <li key={label}><Link href={href} className="text-sm text-muted hover:text-white transition-colors">{label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-muted">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {s.address && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-brand" />{s.address}</span>}
            {s.phone && <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white"><Phone size={14} className="text-emerald-brand" />{s.phone}</a>}
            {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail size={14} className="text-emerald-brand" />{s.email}</a>}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <span>© {new Date().getFullYear()} {s.brandName}</span>
            <Link href="/terms" className="hover:text-white">Conditions d’utilisation</Link>
            <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
