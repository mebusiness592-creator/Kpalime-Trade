import type { UserRole } from '@/types';

export interface AccountTypeInfo {
  value: UserRole;
  label: string;
  description: string;
  home: string; // page d'accueil après connexion
  publishes: string[];
}

/** Types de comptes proposés à l'inscription (l'admin est créé via script). */
export const ACCOUNT_TYPES: AccountTypeInfo[] = [
  { value: 'client', label: 'Acheteur / Client', description: 'Découvrir, contacter, demander des devis, enregistrer des favoris.', home: '/dashboard', publishes: [] },
  { value: 'vendor', label: 'Vendeur / Producteur', description: 'Présenter et vendre vos produits.', home: '/vendor/dashboard', publishes: ['Produits', 'Boutique'] },
  { value: 'accommodation_owner', label: 'Hôtel / Hébergement', description: 'Présenter votre établissement et vos chambres.', home: '/dashboard/accommodations', publishes: ['Hébergements', 'Chambres'] },
  { value: 'restaurant_owner', label: 'Restaurateur', description: 'Présenter votre restaurant, menus et horaires.', home: '/dashboard/listings/restaurant', publishes: ['Restaurants', 'Menus'] },
  { value: 'professional', label: 'Prestataire / Entreprise', description: 'Présenter vos services et réalisations.', home: '/dashboard/listings/service', publishes: ['Services'] },
  { value: 'tourism_operator', label: 'Site touristique / Guide', description: 'Proposer des sites, circuits et activités touristiques.', home: '/dashboard/listings/tourism', publishes: ['Sites touristiques', 'Guides', 'Activités'] },
];

export const PUBLIC_REGISTER_ROLES = ACCOUNT_TYPES.map((a) => a.value);

export function homeForRole(role?: string): string {
  if (role === 'admin') return '/admin/dashboard';
  return ACCOUNT_TYPES.find((a) => a.value === role)?.home ?? '/dashboard';
}

/** Rôles qui possèdent un espace professionnel (publication soumise à validation). */
export const PROFESSIONAL_ROLES: UserRole[] = ['vendor', 'accommodation_owner', 'restaurant_owner', 'professional', 'tourism_operator'];
