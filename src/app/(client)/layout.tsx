import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_TO_LISTING, LISTING_CONFIG } from '@/lib/listing-config';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const s = (await getCurrentUser()) as { role?: string } | null;
  if (!s) redirect('/auth/login');
  const role = s.role ?? 'client';
  const listing = ROLE_TO_LISTING[role];
  const links: { href: string; label: string; icon: string }[] = [{ href: '/dashboard', label: 'Vue d’ensemble', icon: '📊' }];
  if (listing) links.push({ href: `/dashboard/listings/${listing}`, label: LISTING_CONFIG[listing].plural, icon: '📝' });
  if (role === 'accommodation_owner') links.push({ href: '/dashboard/accommodations', label: 'Mes hébergements', icon: '🏨' });
  if (role === 'vendor') links.push({ href: '/vendor/dashboard', label: 'Espace vendeur', icon: '🏪' });
  if (role !== 'client') links.push({ href: '/dashboard/inquiries', label: 'Demandes & devis reçus', icon: '📥' });
  else links.push({ href: '/dashboard/inquiries', label: 'Mes demandes', icon: '📤' }, { href: '/orders', label: 'Mes commandes', icon: '🛒' }, { href: '/favorites', label: 'Favoris', icon: '❤️' });
  links.push({ href: '/notifications', label: 'Notifications', icon: '🔔' }, { href: '/dashboard/support', label: 'Assistance Kpalimé-Trade', icon: '💬' }, { href: '/profile', label: 'Mon profil', icon: '👤' });
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-60 shrink-0 space-y-1">
          <p className="px-4 py-2 text-xs font-bold text-gold uppercase tracking-wider">Mon espace</p>
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-white/10 hover:text-white transition-colors">
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
