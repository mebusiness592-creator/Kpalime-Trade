import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, Package, Tags, ShoppingCart, Coins, Palmtree, Hotel, UtensilsCrossed,
  Palette, CalendarDays, Wrench, Flag, Star, ScrollText, Settings, ImageIcon, LifeBuoy, ClipboardCheck, Inbox, Mail, GalleryHorizontal, Hammer, Compass,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/publications', label: 'Publications à valider', icon: ClipboardCheck },
  { href: '/admin/support', label: 'Assistance & messages', icon: LifeBuoy },
  { href: '/admin/inquiries', label: 'Demandes & devis', icon: Inbox },
  { href: '/admin/contact', label: 'Messages de contact', icon: Mail },
  { href: '/admin/banners', label: 'Bannières d’accueil', icon: GalleryHorizontal },
  { href: '/admin/images', label: 'Images du site', icon: ImageIcon },
  { href: '/admin/users', label: 'Utilisateurs & comptes', icon: Users },
  { href: '/admin/shops', label: 'Boutiques', icon: Store },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/categories', label: 'Catégories de produits', icon: Tags },
  { href: '/admin/taxonomies', label: 'Catégories & types', icon: Tags },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/currencies', label: 'Devises', icon: Coins },
  { href: '/admin/tourism', label: 'Tourisme', icon: Palmtree },
  { href: '/admin/hotels', label: 'Hôtels', icon: Hotel },
  { href: '/admin/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { href: '/admin/culture', label: 'Culture (articles)', icon: Palette },
  { href: '/admin/artisans', label: 'Artisans', icon: Hammer },
  { href: '/admin/guides', label: 'Guides', icon: Compass },
  { href: '/admin/events', label: 'Événements', icon: CalendarDays },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/reports', label: 'Signalements', icon: Flag },
  { href: '/admin/reviews', label: 'Avis', icon: Star },
  { href: '/admin/audit-logs', label: 'Journal d’audit', icon: ScrollText },
  { href: '/admin/settings', label: 'Thème & paramètres', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Double vérification côté serveur (en plus du middleware)
  const user = (await getCurrentUser()) as { role?: string } | null;
  if (!user) redirect('/auth/login?redirect=/admin/dashboard');
  if (user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-60 shrink-0 space-y-1">
          <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Administration</p>
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} prefetch
                className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors touch-target">
                <Icon size={20} className="text-emerald-brand" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
