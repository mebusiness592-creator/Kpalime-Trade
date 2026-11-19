import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { SupportTicket } from '@/models/SupportTicket';
import { ACCOUNT_TYPES } from '@/lib/roles';

export const metadata = { title: 'Mon espace | Kpalimé-Trade' };
export const dynamic = 'force-dynamic';

const ROLE_LINKS: Record<string, { href: string; label: string }[]> = {
  admin: [{ href: '/admin/dashboard', label: 'Ouvrir l’administration' }],
  vendor: [
    { href: '/vendor/dashboard', label: 'Mon espace vendeur' },
    { href: '/vendor/products/new', label: 'Ajouter un produit' },
  ],
  accommodation_owner: [
    { href: '/dashboard/accommodations', label: 'Mes hébergements' },
    { href: '/dashboard/accommodations/new', label: 'Ajouter un établissement' },
  ],
  restaurant_owner: [{ href: '/dashboard/listings/restaurant', label: 'Mes restaurants' }, { href: '/dashboard/listings/restaurant/new', label: 'Ajouter un restaurant' }],
  professional: [{ href: '/dashboard/listings/service', label: 'Mes services' }, { href: '/dashboard/listings/service/new', label: 'Ajouter un service' }],
  tourism_operator: [{ href: '/dashboard/listings/tourism', label: 'Mes sites touristiques' }, { href: '/dashboard/listings/tourism/new', label: 'Ajouter un site touristique' }],
  client: [
    { href: '/favorites', label: 'Mes favoris' },
    { href: '/orders', label: 'Mes commandes' },
  ],
};

export default async function DashboardPage() {
  const session = (await getCurrentUser()) as { userId?: string; role?: string; name?: string } | null;
  if (!session?.userId) redirect('/auth/login?redirect=/dashboard');

  await connectDB();
  const [unread, openTickets] = await Promise.all([
    Notification.countDocuments({ userId: session.userId, readAt: { $exists: false } }),
    SupportTicket.countDocuments({ userId: session.userId, status: { $nin: ['resolved', 'closed'] } }),
  ]);
  const type = ACCOUNT_TYPES.find((a) => a.value === session.role);
  const links = [
    ...(ROLE_LINKS[session.role ?? 'client'] ?? []),
    { href: '/dashboard/inquiries', label: 'Demandes & devis' },
    { href: '/dashboard/support', label: `Assistance Kpalimé-Trade${openTickets ? ` (${openTickets} en cours)` : ''}` },
    { href: '/notifications', label: `Notifications${unread ? ` (${unread} non lues)` : ''}` },
    { href: '/profile', label: 'Mon profil' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour {session.name ?? ''}</h1>
        <p className="text-sm text-muted">{type ? `${type.label} — ${type.description}` : 'Votre espace personnel'}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-xl border border-white/10 bg-night-light p-5 font-medium text-white hover:bg-white/5 transition-colors">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}
