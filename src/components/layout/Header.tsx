'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ShoppingCart, ChevronDown, Search, LogIn, UserPlus, LogOut, LayoutDashboard, Bell, LifeBuoy, Settings,
} from 'lucide-react';
import { CurrencySelector } from '@/components/currency/CurrencySelector';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { homeForRole } from '@/lib/roles';
import { cn } from '@/lib/utils';

interface NavGroup { label: string; href: string; items: { href: string; label: string; desc: string }[] }

const NAV: NavGroup[] = [
  { label: 'Marketplace', href: '/marketplace', items: [
    { href: '/marketplace', label: 'Tous les produits', desc: 'Produits locaux, du producteur à l’acheteur' },
    { href: '/marketplace/categories/agriculture-agroalimentaire', label: 'Agriculture & agroalimentaire', desc: 'Céréales, fruits, produits transformés' },
    { href: '/marketplace/categories/cafe-cacao-produits-agricoles', label: 'Café, cacao & produits agricoles', desc: 'Les grands produits d’exportation' },
    { href: '/marketplace/categories/arts-artisanat', label: 'Arts & artisanat', desc: 'Savoir-faire des artisans togolais' },
    { href: '/shops', label: 'Boutiques & fournisseurs', desc: 'Vendeurs et entreprises vérifiés' },
  ] },
  { label: 'Explorer le Togo', href: '/discover', items: [
    { href: '/discover', label: 'Les 5 régions', desc: 'Maritime, Plateaux, Centrale, Kara, Savanes' },
    { href: '/tourism', label: 'Sites touristiques', desc: 'Cascades, montagnes, villages, patrimoine' },
    { href: '/hotels', label: 'Hôtels & hébergements', desc: 'Réservez votre séjour' },
    { href: '/restaurants', label: 'Restaurants', desc: 'Cuisine locale et gastronomie' },
    { href: '/events', label: 'Événements', desc: 'Festivals, expositions, rencontres' },
    { href: '/culture', label: 'Culture & artisans', desc: 'Traditions, histoire, créateurs' },
  ] },
  { label: 'Entreprises & services', href: '/services', items: [
    { href: '/services', label: 'Annuaire des professionnels', desc: 'Construction, transport, numérique, conseil…' },
    { href: '/culture/artisans', label: 'Artisans & ateliers', desc: 'Production et savoir-faire locaux' },
    { href: '/tourism/guides', label: 'Guides touristiques', desc: 'Accompagnateurs certifiés' },
    { href: '/auth/register', label: 'Inscrire mon entreprise', desc: 'Gagnez en visibilité, gratuitement' },
  ] },
];

export function Header({ brandName, logoUrl, announcement }: { brandName: string; logoUrl?: string; announcement?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { totalItems } = useCart();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [account, setAccount] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => { setOpen(null); setMobile(false); setAccount(false); }, [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(null); setAccount(false); } };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q.trim())}`); setQ(''); } };
  const dash = user ? homeForRole(user.role) : '/auth/login';
  const isActive = (g: NavGroup) => g.items.some((i) => pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href)));

  return (
    <header ref={ref} className="sticky top-0 z-50">
      {announcement && <div className="bg-gold text-night text-center text-xs sm:text-sm font-medium py-1.5 px-3">{announcement}</div>}
      <div className="bg-night/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => setMobile(!mobile)} className="lg:hidden touch-target p-2 rounded-md text-white hover:bg-white/10" aria-label="Menu">{mobile ? <X size={24} /> : <Menu size={24} />}</button>

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt={brandName} className="h-9 w-auto" /> : <span className="w-9 h-9 rounded-md bg-emerald-brand flex items-center justify-center text-white font-bold">KT</span>}
            <span className="text-lg font-bold text-white hidden sm:block">{brandName}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Navigation principale">
            {NAV.map((g) => (
              <div key={g.label} className="relative">
                <button onClick={() => setOpen(open === g.label ? null : g.label)} onMouseEnter={() => setOpen(g.label)} aria-expanded={open === g.label}
                  className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors', isActive(g) ? 'text-white bg-white/10' : 'text-muted hover:text-white hover:bg-white/5')}>
                  {g.label}<ChevronDown size={15} className={cn('transition-transform', open === g.label && 'rotate-180')} />
                </button>
                {open === g.label && (
                  <div onMouseLeave={() => setOpen(null)} className="absolute left-0 top-full mt-2 w-[380px] rounded-xl border border-white/10 bg-night-light shadow-2xl p-2 animate-fade-in">
                    {g.items.map((it) => (
                      <Link key={it.href + it.label} href={it.href} className="block rounded-lg px-4 py-3 hover:bg-white/5">
                        <span className="block text-sm font-semibold text-white">{it.label}</span>
                        <span className="block text-xs text-muted mt-0.5">{it.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/contact" className="px-3.5 py-2 rounded-md text-sm font-medium text-muted hover:text-white hover:bg-white/5">Contact</Link>
          </nav>

          <form onSubmit={search} className="hidden xl:block flex-1 max-w-xs ml-auto relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="w-full pl-9 pr-3 py-2 rounded-md bg-night-light border border-white/10 text-white placeholder-muted text-sm focus:border-emerald-brand focus:outline-none" />
          </form>

          <div className="flex items-center gap-1.5 ml-auto xl:ml-0">
            <Link href="/search" className="xl:hidden touch-target p-2 rounded-md text-muted hover:bg-white/10 hover:text-white" aria-label="Rechercher"><Search size={22} /></Link>
            <CurrencySelector />
            <Link href="/checkout" className="relative touch-target p-2 rounded-md text-muted hover:bg-white/10 hover:text-white" aria-label="Panier">
              <ShoppingCart size={22} />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-night bg-gold rounded-full">{totalItems}</span>}
            </Link>
            {!isLoading && (user ? (
              <div className="relative">
                <button onClick={() => setAccount(!account)} className="touch-target flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-white/10" aria-label="Mon compte">
                  <span className="w-8 h-8 rounded-md bg-emerald-brand flex items-center justify-center text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  <ChevronDown size={14} className="text-muted" />
                </button>
                {account && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-night-light shadow-2xl py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-white/10"><p className="text-sm font-semibold text-white truncate">{user.name}</p><p className="text-xs text-muted truncate">{user.email}</p></div>
                    {[[dash, 'Mon espace', LayoutDashboard], ['/notifications', 'Notifications', Bell], ['/dashboard/support', 'Assistance', LifeBuoy], ['/profile', 'Mon profil', Settings]].map(([href, label, Icon]) => {
                      const I = Icon as typeof Bell;
                      return <Link key={String(href)} href={String(href)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-white"><I size={17} className="text-emerald-brand" />{String(label)}</Link>;
                    })}
                    <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 border-t border-white/10 mt-1"><LogOut size={17} />Se déconnecter</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted hover:bg-white/10 hover:text-white"><LogIn size={18} />Connexion</Link>
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-emerald-brand text-white hover:bg-emerald-light"><UserPlus size={18} /><span className="hidden sm:inline">Inscription</span><span className="sm:hidden">Compte</span></Link>
              </>
            ))}
          </div>
        </div>
      </div>

      {mobile && (
        <div className="lg:hidden absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto bg-night-light border-b border-white/10 shadow-2xl animate-slide-up">
          <form onSubmit={search} className="p-4 pb-2 relative">
            <Search size={16} className="absolute left-7 top-1/2 -translate-y-[40%] text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="w-full pl-9 pr-3 py-2.5 rounded-md bg-night border border-white/10 text-white placeholder-muted text-sm" />
          </form>
          {NAV.map((g) => (
            <div key={g.label} className="px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gold mb-1">{g.label}</p>
              {g.items.map((it) => <Link key={it.href + it.label} href={it.href} className="block px-3 py-2.5 rounded-md text-sm text-white/90 hover:bg-white/5">{it.label}</Link>)}
            </div>
          ))}
          <div className="p-4 flex gap-2">
            <Link href="/contact" className="flex-1 text-center px-4 py-2.5 rounded-md bg-white/10 text-white text-sm">Contact</Link>
            {!user && <Link href="/auth/login" className="flex-1 text-center px-4 py-2.5 rounded-md bg-white/10 text-white text-sm">Connexion</Link>}
          </div>
        </div>
      )}
    </header>
  );
}
