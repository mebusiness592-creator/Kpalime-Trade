/** Configuration isomorphe (client + serveur) des publications professionnelles. */
export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'tags' | 'image' | 'gallery' | 'email' | 'boolean' | 'date';
export interface FieldDef { name: string; label: string; type: FieldType; required?: boolean; options?: { value: string; label: string }[]; help?: string; col?: 1 | 2; taxonomy?: string }

export type ListingType = 'restaurant' | 'service' | 'tourism';

export interface ListingConfig {
  type: ListingType;
  role: string;
  label: string;       // singulier
  plural: string;
  publicPath: string;  // /restaurants
  galleryField: 'images' | 'portfolio';
  sensitive: string[];
  fields: FieldDef[];
}

const opts = (...v: [string, string][]) => v.map(([value, label]) => ({ value, label }));

export const LISTING_CONFIG: Record<ListingType, ListingConfig> = {
  restaurant: {
    type: 'restaurant', role: 'restaurant_owner', label: 'restaurant', plural: 'Mes restaurants', publicPath: '/restaurants',
    galleryField: 'images', sensitive: ['name', 'description', 'images', 'logo'],
    fields: [
      { name: 'name', label: 'Nom du restaurant', type: 'text', required: true, col: 2 },
      { name: 'cuisineType', label: 'Type de cuisine', type: 'select', required: true, taxonomy: 'restaurant' },
      { name: 'priceRange', label: 'Gamme de prix', type: 'select', options: opts(['budget', 'Économique'], ['mid', 'Intermédiaire'], ['premium', 'Haut de gamme']) },
      { name: 'description', label: 'Présentation', type: 'textarea', required: true, col: 2 },
      { name: 'address', label: 'Adresse', type: 'text', required: true },
      { name: 'city', label: 'Ville', type: 'text' },
      { name: 'district', label: 'Quartier', type: 'text' },
      { name: 'openingHours', label: 'Horaires d’ouverture', type: 'text', required: true, help: 'Ex. Lun–Sam 8h–22h' },
      { name: 'phone', label: 'Téléphone', type: 'text', required: true },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'specialties', label: 'Spécialités (menu)', type: 'tags', help: 'Séparez par des virgules', col: 2 },
      { name: 'services', label: 'Services proposés', type: 'tags', help: 'Terrasse, livraison, wifi…', col: 2 },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'images', label: 'Photos', type: 'gallery', col: 2 },
    ],
  },
  service: {
    type: 'service', role: 'professional', label: 'service', plural: 'Mes services', publicPath: '/services',
    galleryField: 'portfolio', sensitive: ['name', 'description', 'portfolio', 'logo'],
    fields: [
      { name: 'name', label: 'Nom de l’entreprise / du prestataire', type: 'text', required: true, col: 2 },
      { name: 'category', label: 'Catégorie de service', type: 'select', taxonomy: 'service', help: 'Laissez vide : la plateforme choisit automatiquement selon votre activité.' },
      { name: 'priceRange', label: 'Tarifs (indicatif)', type: 'text' },
      { name: 'description', label: 'Présentation de l’activité', type: 'textarea', required: true, col: 2 },
      { name: 'skills', label: 'Services / compétences', type: 'tags', help: 'Séparez par des virgules', col: 2 },
      { name: 'phone', label: 'Téléphone', type: 'text', required: true },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'email', label: 'E-mail professionnel', type: 'email' },
      { name: 'address', label: 'Adresse', type: 'text' },
      { name: 'city', label: 'Ville', type: 'text' },
      { name: 'availability', label: 'Disponibilité', type: 'text', help: 'Ex. Lun–Sam 8h–18h' },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'portfolio', label: 'Réalisations (photos)', type: 'gallery', col: 2 },
    ],
  },
  tourism: {
    type: 'tourism', role: 'tourism_operator', label: 'site touristique', plural: 'Mes sites touristiques', publicPath: '/tourism',
    galleryField: 'images', sensitive: ['name', 'description', 'shortDescription', 'images'],
    fields: [
      { name: 'name', label: 'Nom du site / de l’activité', type: 'text', required: true, col: 2 },
      { name: 'category', label: 'Catégorie', type: 'select', taxonomy: 'tourism', help: 'Laissez vide : la plateforme choisit automatiquement selon la description.' },
      { name: 'difficulty', label: 'Difficulté', type: 'select', options: opts(['easy', 'Facile'], ['medium', 'Moyenne'], ['hard', 'Difficile']) },
      { name: 'shortDescription', label: 'Résumé (une phrase)', type: 'text', required: true, col: 2 },
      { name: 'description', label: 'Description détaillée', type: 'textarea', required: true, col: 2 },
      { name: 'address', label: 'Adresse / accès', type: 'text' },
      { name: 'city', label: 'Ville', type: 'text' },
      { name: 'entranceFee', label: 'Prix d’entrée (FCFA)', type: 'number' },
      { name: 'duration', label: 'Durée de la visite', type: 'text' },
      { name: 'openingHours', label: 'Horaires', type: 'text' },
      { name: 'bestPeriod', label: 'Meilleure période', type: 'text' },
      { name: 'contactPhone', label: 'Téléphone de contact', type: 'text' },
      { name: 'gpsLat', label: 'Latitude GPS', type: 'number' },
      { name: 'gpsLng', label: 'Longitude GPS', type: 'number' },
      { name: 'activities', label: 'Activités proposées', type: 'tags', col: 2 },
      { name: 'images', label: 'Photos', type: 'gallery', col: 2 },
    ],
  },
};

export const ROLE_TO_LISTING: Record<string, ListingType> = {
  restaurant_owner: 'restaurant', professional: 'service', tourism_operator: 'tourism',
};

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-gray-500/20 text-gray-300' },
  pending: { label: 'En attente de validation', cls: 'bg-yellow-500/20 text-yellow-300' },
  needs_correction: { label: 'À corriger', cls: 'bg-orange-500/20 text-orange-300' },
  approved: { label: 'Publié', cls: 'bg-emerald-500/20 text-emerald-300' },
  rejected: { label: 'Refusé', cls: 'bg-red-500/20 text-red-300' },
  suspended: { label: 'Suspendu', cls: 'bg-purple-500/20 text-purple-300' },
};
