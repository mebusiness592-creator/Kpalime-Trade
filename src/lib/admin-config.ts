/** Configuration isomorphe des menus d'administration (colonnes, actions, formulaires). */
import { LISTING_CONFIG, type FieldDef } from '@/lib/listing-config';

export type ColKind = 'text' | 'badge' | 'bool' | 'date' | 'money' | 'list' | 'image';
export interface Col { key: string; label: string; kind?: ColKind }
export interface AdminAction {
  key: string; label: string; tone?: 'good' | 'bad' | 'warn' | 'neutral';
  set?: Record<string, unknown>;           // champs modifiés ('$now' = date du jour)
  needsNote?: boolean; noteField?: string; // message obligatoire stocké dans noteField
  options?: { value: string; label: string }[]; optionField?: string; // action à choix (ex. rôle)
  confirm?: string; delete?: boolean;
  show?: (row: Record<string, unknown>) => boolean;
  notify?: string;                          // message envoyé au propriétaire
}
export interface ResourceCfg {
  key: string; label: string; singular: string; description?: string;
  columns: Col[]; searchFields: string[];
  statusField?: string; statuses?: { value: string; label: string; cls: string }[];
  fields?: FieldDef[]; canCreate?: boolean; canDelete?: boolean;
  actions: AdminAction[]; publicPath?: string; slugFrom?: string;
}

const S = {
  pending: { value: 'pending', label: 'En attente', cls: 'bg-yellow-500/20 text-yellow-300' },
  approved: { value: 'approved', label: 'Approuvé', cls: 'bg-emerald-500/20 text-emerald-300' },
  rejected: { value: 'rejected', label: 'Refusé', cls: 'bg-red-500/20 text-red-300' },
  suspended: { value: 'suspended', label: 'Suspendu', cls: 'bg-purple-500/20 text-purple-300' },
  needs: { value: 'needs_correction', label: 'À corriger', cls: 'bg-orange-500/20 text-orange-300' },
  draft: { value: 'draft', label: 'Brouillon', cls: 'bg-gray-500/20 text-gray-300' },
};
const listingStatuses = [S.pending, S.needs, S.approved, S.rejected, S.suspended, S.draft];
const is = (f: string, ...v: unknown[]) => (r: Record<string, unknown>) => v.includes(r[f]);

/** Actions de modération communes aux fiches (restaurants, services, tourisme, hôtels). */
const moderation = (noteField: string, extra: Record<string, unknown> = {}): AdminAction[] => [
  { key: 'approve', label: 'Approuver', tone: 'good', set: { status: 'approved', isActive: true, ...extra }, show: is('status', 'pending', 'needs_correction', 'rejected', 'suspended'), notify: 'a été approuvé et est maintenant visible publiquement.' },
  { key: 'correct', label: 'À corriger', tone: 'warn', set: { status: 'needs_correction', isActive: false }, needsNote: true, noteField, show: is('status', 'pending'), notify: 'nécessite une correction :' },
  { key: 'reject', label: 'Refuser', tone: 'bad', set: { status: 'rejected', isActive: false }, needsNote: true, noteField, show: is('status', 'pending', 'needs_correction'), notify: 'a été refusé :' },
  { key: 'suspend', label: 'Suspendre', tone: 'bad', set: { status: 'suspended', isActive: false }, needsNote: true, noteField, show: is('status', 'approved'), notify: 'a été suspendu :' },
  { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => r.status === 'approved' && !r.isFeatured },
  { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
];
const toggleActive: AdminAction[] = [
  { key: 'activate', label: 'Activer', tone: 'good', set: { isActive: true }, show: (r) => !r.isActive },
  { key: 'deactivate', label: 'Désactiver', tone: 'warn', set: { isActive: false }, show: (r) => !!r.isActive },
  { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => !r.isFeatured },
  { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
];
const opt = (...v: [string, string][]) => v.map(([value, label]) => ({ value, label }));

export const ADMIN_RESOURCES: Record<string, ResourceCfg> = {
  users: {
    key: 'users', label: 'Utilisateurs & comptes', singular: 'utilisateur', description: 'Tous les comptes de la plateforme : acheteurs, vendeurs, hébergeurs, restaurateurs, prestataires, guides.',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'email', label: 'E-mail' }, { key: 'role', label: 'Type de compte', kind: 'badge' }, { key: 'phone', label: 'Téléphone' }, { key: 'isVerified', label: 'Vérifié', kind: 'bool' }, { key: 'isActive', label: 'Actif', kind: 'bool' }, { key: 'createdAt', label: 'Inscrit le', kind: 'date' }],
    searchFields: ['name', 'email', 'phone'], statusField: 'role',
    statuses: [
      { value: 'client', label: 'Acheteurs', cls: '' }, { value: 'vendor', label: 'Vendeurs', cls: '' }, { value: 'accommodation_owner', label: 'Hébergeurs', cls: '' },
      { value: 'restaurant_owner', label: 'Restaurateurs', cls: '' }, { value: 'professional', label: 'Prestataires', cls: '' }, { value: 'tourism_operator', label: 'Tourisme / guides', cls: '' }, { value: 'admin', label: 'Administrateurs', cls: '' },
    ],
    actions: [
      { key: 'verify', label: 'Vérifier le compte', tone: 'good', set: { isVerified: true }, show: (r) => !r.isVerified, notify: 'Votre compte professionnel a été vérifié.' },
      { key: 'suspend', label: 'Suspendre', tone: 'bad', set: { isActive: false }, confirm: 'Suspendre ce compte ?', show: (r) => !!r.isActive },
      { key: 'reactivate', label: 'Réactiver', tone: 'good', set: { isActive: true }, show: (r) => !r.isActive },
      { key: 'role', label: 'Changer le type de compte', tone: 'neutral', optionField: 'role', options: opt(['client', 'Acheteur'], ['vendor', 'Vendeur'], ['accommodation_owner', 'Hébergeur'], ['restaurant_owner', 'Restaurateur'], ['professional', 'Prestataire'], ['tourism_operator', 'Tourisme / guide'], ['admin', 'Administrateur']) },
    ],
  },
  shops: {
    key: 'shops', label: 'Boutiques', singular: 'boutique', publicPath: '/shops',
    columns: [{ key: 'name', label: 'Boutique' }, { key: 'ownerId.name', label: 'Propriétaire' }, { key: 'city', label: 'Ville' }, { key: 'status', label: 'Statut', kind: 'badge' }, { key: 'createdAt', label: 'Créée le', kind: 'date' }],
    searchFields: ['name', 'city', 'phone'], statusField: 'status', statuses: [S.pending, S.approved, S.rejected, S.suspended],
    canDelete: true,
    actions: [
      { key: 'approve', label: 'Approuver', tone: 'good', set: { status: 'approved', approvedAt: '$now' }, show: is('status', 'pending', 'rejected', 'suspended'), notify: 'a été approuvée : elle est maintenant visible.' },
      { key: 'reject', label: 'Refuser', tone: 'bad', set: { status: 'rejected' }, needsNote: true, noteField: 'adminNote', show: is('status', 'pending'), notify: 'a été refusée :' },
      { key: 'suspend', label: 'Suspendre', tone: 'bad', set: { status: 'suspended' }, needsNote: true, noteField: 'adminNote', show: is('status', 'approved'), notify: 'a été suspendue :' },
      { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => !r.isFeatured },
      { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
    ],
  },
  products: {
    key: 'products', label: 'Produits', singular: 'produit', publicPath: '/marketplace',
    columns: [{ key: 'images', label: 'Photo', kind: 'image' }, { key: 'name', label: 'Produit' }, { key: 'shopId.name', label: 'Boutique' }, { key: 'categoryId.name', label: 'Catégorie' }, { key: 'price', label: 'Prix', kind: 'money' }, { key: 'stock', label: 'Stock' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['name'], statusField: 'status',
    statuses: [S.pending, { value: 'active', label: 'Publié', cls: 'bg-emerald-500/20 text-emerald-300' }, { value: 'inactive', label: 'Désactivé', cls: 'bg-gray-500/20 text-gray-300' }, S.rejected],
    canDelete: true,
    actions: [
      { key: 'approve', label: 'Publier', tone: 'good', set: { status: 'active' }, show: is('status', 'pending', 'inactive', 'rejected'), notify: 'a été validé et publié.' },
      { key: 'reject', label: 'Refuser', tone: 'bad', set: { status: 'rejected' }, needsNote: true, noteField: 'adminNote', show: is('status', 'pending'), notify: 'a été refusé :' },
      { key: 'deactivate', label: 'Désactiver', tone: 'warn', set: { status: 'inactive' }, show: is('status', 'active') },
      { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => !r.isFeatured },
      { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
    ],
  },
  categories: {
    key: 'categories', label: 'Catégories', singular: 'catégorie', canCreate: true, canDelete: true, slugFrom: 'name',
    columns: [{ key: 'image', label: 'Image', kind: 'image' }, { key: 'name', label: 'Nom' }, { key: 'slug', label: 'Identifiant' }, { key: 'position', label: 'Ordre' }, { key: 'isActive', label: 'Active', kind: 'bool' }],
    searchFields: ['name', 'slug'],
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true }, { name: 'position', label: 'Ordre d’affichage', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', col: 2 }, { name: 'image', label: 'Image', type: 'image' }, { name: 'isActive', label: 'Catégorie active', type: 'boolean' },
    ],
    actions: toggleActive.slice(0, 2),
  },
  orders: {
    key: 'orders', label: 'Commandes', singular: 'commande',
    columns: [{ key: 'reference', label: 'Référence' }, { key: 'userId.name', label: 'Client' }, { key: 'total', label: 'Total', kind: 'money' }, { key: 'paymentStatus', label: 'Paiement', kind: 'badge' }, { key: 'status', label: 'Statut', kind: 'badge' }, { key: 'createdAt', label: 'Date', kind: 'date' }],
    searchFields: ['reference', 'phone'], statusField: 'status',
    statuses: [S.pending, { value: 'confirmed', label: 'Confirmée', cls: 'bg-blue-500/20 text-blue-300' }, { value: 'preparing', label: 'En préparation', cls: 'bg-blue-500/20 text-blue-300' }, { value: 'shipped', label: 'Expédiée', cls: 'bg-indigo-500/20 text-indigo-300' }, { value: 'delivered', label: 'Livrée', cls: 'bg-emerald-500/20 text-emerald-300' }, { value: 'cancelled', label: 'Annulée', cls: 'bg-red-500/20 text-red-300' }],
    actions: [
      { key: 'confirm', label: 'Confirmer', tone: 'good', set: { status: 'confirmed' }, show: is('status', 'pending'), notify: 'Votre commande est confirmée.' },
      { key: 'prepare', label: 'En préparation', tone: 'neutral', set: { status: 'preparing' }, show: is('status', 'confirmed'), notify: 'Votre commande est en préparation.' },
      { key: 'ship', label: 'Expédiée', tone: 'neutral', set: { status: 'shipped' }, show: is('status', 'preparing'), notify: 'Votre commande a été expédiée.' },
      { key: 'deliver', label: 'Livrée', tone: 'good', set: { status: 'delivered', deliveredAt: '$now' }, show: is('status', 'shipped'), notify: 'Votre commande a été livrée.' },
      { key: 'paid', label: 'Marquer payée', tone: 'good', set: { paymentStatus: 'paid' }, show: (r) => r.paymentStatus !== 'paid' },
      { key: 'cancel', label: 'Annuler', tone: 'bad', set: { status: 'cancelled' }, confirm: 'Annuler cette commande ?', show: is('status', 'pending', 'confirmed', 'preparing'), notify: 'Votre commande a été annulée.' },
    ],
  },
  currencies: {
    key: 'currencies', label: 'Devises', singular: 'devise', canCreate: true, canDelete: true,
    columns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Nom' }, { key: 'symbol', label: 'Symbole' }, { key: 'rateToXOF', label: 'Taux (1 unité en XOF)' }, { key: 'isDefault', label: 'Par défaut', kind: 'bool' }, { key: 'isActive', label: 'Active', kind: 'bool' }],
    searchFields: ['code', 'name'],
    fields: [
      { name: 'code', label: 'Code', type: 'select', required: true, options: opt(['XOF', 'XOF'], ['USD', 'USD'], ['EUR', 'EUR']) }, { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'symbol', label: 'Symbole', type: 'text', required: true }, { name: 'rateToXOF', label: 'Taux en XOF', type: 'number', required: true },
      { name: 'isActive', label: 'Active', type: 'boolean' },
    ],
    actions: toggleActive.slice(0, 2),
  },
  events: {
    key: 'events', label: 'Événements', singular: 'événement', canCreate: true, canDelete: true, slugFrom: 'title', publicPath: '/events',
    columns: [{ key: 'poster', label: 'Affiche', kind: 'image' }, { key: 'title', label: 'Titre' }, { key: 'category', label: 'Type' }, { key: 'startDate', label: 'Début', kind: 'date' }, { key: 'location', label: 'Lieu' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['title', 'location'], statusField: 'status',
    statuses: [S.pending, { value: 'published', label: 'Publié', cls: 'bg-emerald-500/20 text-emerald-300' }, { value: 'cancelled', label: 'Annulé', cls: 'bg-red-500/20 text-red-300' }, { value: 'finished', label: 'Terminé', cls: 'bg-gray-500/20 text-gray-300' }],
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, col: 2 },
      { name: 'category', label: 'Type', type: 'select', required: true, options: opt(['concert', 'Concert'], ['festival', 'Festival'], ['exposition', 'Exposition'], ['conference', 'Conférence'], ['sport', 'Sport'], ['culturel', 'Culturel'], ['marche', 'Marché'], ['autre', 'Autre']) },
      { name: 'location', label: 'Lieu', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: true, col: 2 },
      { name: 'startDate', label: 'Date de début', type: 'date', required: true }, { name: 'endDate', label: 'Date de fin', type: 'date' },
      { name: 'startTime', label: 'Heure de début', type: 'text' }, { name: 'endTime', label: 'Heure de fin', type: 'text' },
      { name: 'address', label: 'Adresse', type: 'text' }, { name: 'organizer', label: 'Organisateur', type: 'text' },
      { name: 'contactPhone', label: 'Téléphone', type: 'text' }, { name: 'contactEmail', label: 'E-mail', type: 'email' },
      { name: 'price', label: 'Prix (FCFA)', type: 'number' }, { name: 'isFree', label: 'Entrée gratuite', type: 'boolean' },
      { name: 'poster', label: 'Affiche', type: 'image' }, { name: 'images', label: 'Photos', type: 'gallery', col: 2 },
    ],
    actions: [
      { key: 'publish', label: 'Publier', tone: 'good', set: { status: 'published' }, show: is('status', 'pending', 'cancelled') },
      { key: 'cancel', label: 'Annuler', tone: 'bad', set: { status: 'cancelled' }, show: is('status', 'published') },
      { key: 'finish', label: 'Marquer terminé', tone: 'neutral', set: { status: 'finished' }, show: is('status', 'published') },
      { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => !r.isFeatured },
      { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
    ],
  },
  culture: {
    key: 'culture', label: 'Culture (articles)', singular: 'article', canCreate: true, canDelete: true, slugFrom: 'title', publicPath: '/culture',
    columns: [{ key: 'coverImage', label: 'Image', kind: 'image' }, { key: 'title', label: 'Titre' }, { key: 'category', label: 'Rubrique' }, { key: 'isFeatured', label: 'À la une', kind: 'bool' }, { key: 'isActive', label: 'Publié', kind: 'bool' }],
    searchFields: ['title', 'excerpt'],
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, col: 2 },
      { name: 'category', label: 'Rubrique', type: 'select', required: true, options: opt(['histoire', 'Histoire'], ['tradition', 'Tradition'], ['patrimoine', 'Patrimoine'], ['musique', 'Musique'], ['danse', 'Danse'], ['gastronomie', 'Gastronomie'], ['autre', 'Autre']) },
      { name: 'author', label: 'Auteur', type: 'text' }, { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true, col: 2 },
      { name: 'content', label: 'Contenu', type: 'textarea', required: true, col: 2 }, { name: 'coverImage', label: 'Image de couverture', type: 'image' },
      { name: 'isActive', label: 'Publié', type: 'boolean' }, { name: 'isFeatured', label: 'À la une', type: 'boolean' },
    ],
    actions: toggleActive,
  },
  artisans: {
    key: 'artisans', label: 'Artisans', singular: 'artisan', canCreate: true, canDelete: true, publicPath: '/culture/artisans',
    columns: [{ key: 'photo', label: 'Photo', kind: 'image' }, { key: 'name', label: 'Nom' }, { key: 'specialty', label: 'Spécialité' }, { key: 'location', label: 'Lieu' }, { key: 'isActive', label: 'Actif', kind: 'bool' }],
    searchFields: ['name', 'specialty'],
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true }, { name: 'specialty', label: 'Spécialité', type: 'text', required: true },
      { name: 'bio', label: 'Présentation', type: 'textarea', required: true, col: 2 }, { name: 'location', label: 'Lieu', type: 'text' },
      { name: 'phone', label: 'Téléphone', type: 'text' }, { name: 'whatsapp', label: 'WhatsApp', type: 'text' }, { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'photo', label: 'Photo', type: 'image' }, { name: 'gallery', label: 'Galerie', type: 'gallery', col: 2 }, { name: 'isActive', label: 'Actif', type: 'boolean' },
    ],
    actions: toggleActive,
  },
  guides: {
    key: 'guides', label: 'Guides touristiques', singular: 'guide', canCreate: true, canDelete: true, publicPath: '/tourism/guides',
    columns: [{ key: 'photo', label: 'Photo', kind: 'image' }, { key: 'name', label: 'Nom' }, { key: 'zone', label: 'Zone' }, { key: 'languages', label: 'Langues', kind: 'list' }, { key: 'isActive', label: 'Actif', kind: 'bool' }],
    searchFields: ['name', 'zone'],
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true }, { name: 'zone', label: 'Zone couverte', type: 'text', required: true },
      { name: 'phone', label: 'Téléphone', type: 'text', required: true }, { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'languages', label: 'Langues', type: 'tags' }, { name: 'specialties', label: 'Spécialités', type: 'tags' },
      { name: 'description', label: 'Présentation', type: 'textarea', required: true, col: 2 }, { name: 'dailyRate', label: 'Tarif journalier (FCFA)', type: 'number' },
      { name: 'experienceYears', label: 'Années d’expérience', type: 'number' }, { name: 'photo', label: 'Photo', type: 'image' }, { name: 'isActive', label: 'Actif', type: 'boolean' },
    ],
    actions: toggleActive.slice(0, 2),
  },
  reviews: {
    key: 'reviews', label: 'Avis', singular: 'avis', canDelete: true,
    columns: [{ key: 'userId.name', label: 'Auteur' }, { key: 'reviewableType', label: 'Sur' }, { key: 'rating', label: 'Note' }, { key: 'comment', label: 'Commentaire' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['comment'], statusField: 'status',
    statuses: [{ value: 'visible', label: 'Visible', cls: 'bg-emerald-500/20 text-emerald-300' }, { value: 'reported', label: 'Signalé', cls: 'bg-orange-500/20 text-orange-300' }, { value: 'hidden', label: 'Masqué', cls: 'bg-gray-500/20 text-gray-300' }],
    actions: [
      { key: 'hide', label: 'Masquer', tone: 'warn', set: { status: 'hidden' }, show: (r) => r.status !== 'hidden' },
      { key: 'show', label: 'Rendre visible', tone: 'good', set: { status: 'visible' }, show: (r) => r.status !== 'visible' },
    ],
  },
  reports: {
    key: 'reports', label: 'Signalements', singular: 'signalement',
    columns: [{ key: 'reporterId.name', label: 'Signalé par' }, { key: 'reportableType', label: 'Concerne' }, { key: 'reason', label: 'Motif' }, { key: 'details', label: 'Détails' }, { key: 'status', label: 'Statut', kind: 'badge' }, { key: 'createdAt', label: 'Date', kind: 'date' }],
    searchFields: ['reason', 'details'], statusField: 'status',
    statuses: [{ value: 'new', label: 'Nouveau', cls: 'bg-yellow-500/20 text-yellow-300' }, { value: 'investigating', label: 'En cours', cls: 'bg-blue-500/20 text-blue-300' }, { value: 'resolved', label: 'Résolu', cls: 'bg-emerald-500/20 text-emerald-300' }, { value: 'dismissed', label: 'Classé', cls: 'bg-gray-500/20 text-gray-300' }],
    actions: [
      { key: 'investigate', label: 'Examiner', tone: 'neutral', set: { status: 'investigating' }, show: is('status', 'new') },
      { key: 'resolve', label: 'Résolu', tone: 'good', set: { status: 'resolved', resolvedAt: '$now' }, show: is('status', 'new', 'investigating') },
      { key: 'dismiss', label: 'Classer sans suite', tone: 'warn', set: { status: 'dismissed', resolvedAt: '$now' }, show: is('status', 'new', 'investigating') },
    ],
  },
  contact: {
    key: 'contact', label: 'Messages de contact', singular: 'message', canDelete: true,
    description: 'Messages envoyés depuis la page Contact du site.',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'email', label: 'E-mail' }, { key: 'phone', label: 'Téléphone' }, { key: 'subject', label: 'Sujet' }, { key: 'message', label: 'Message' }, { key: 'status', label: 'Statut', kind: 'badge' }, { key: 'createdAt', label: 'Reçu le', kind: 'date' }],
    searchFields: ['name', 'email', 'subject', 'message'], statusField: 'status',
    statuses: [{ value: 'new', label: 'Nouveau', cls: 'bg-yellow-500/20 text-yellow-300' }, { value: 'read', label: 'Lu', cls: 'bg-blue-500/20 text-blue-300' }, { value: 'done', label: 'Traité', cls: 'bg-emerald-500/20 text-emerald-300' }],
    actions: [{ key: 'read', label: 'Marquer lu', tone: 'neutral', set: { status: 'read' }, show: is('status', 'new') }, { key: 'done', label: 'Traité', tone: 'good', set: { status: 'done' }, show: is('status', 'new', 'read') }],
  },
  banners: {
    key: 'banners', label: 'Bannières de l’accueil', singular: 'bannière', canCreate: true, canDelete: true,
    description: 'Diapositives du grand bandeau de la page d’accueil : image en arrière-plan, texte et boutons par-dessus.',
    columns: [{ key: 'imageUrl', label: 'Image', kind: 'image' }, { key: 'title', label: 'Titre' }, { key: 'subtitle', label: 'Sous-titre' }, { key: 'order', label: 'Ordre' }, { key: 'isActive', label: 'Affichée', kind: 'bool' }],
    searchFields: ['title', 'subtitle'],
    fields: [
      { name: 'imageUrl', label: 'Image de fond (format paysage, 1920×900 conseillé)', type: 'image', required: true, col: 2 },
      { name: 'eyebrow', label: 'Petit texte au-dessus du titre', type: 'text' }, { name: 'order', label: 'Ordre (1 = premier)', type: 'number' },
      { name: 'title', label: 'Titre principal', type: 'text', required: true, col: 2 }, { name: 'subtitle', label: 'Sous-titre', type: 'textarea', col: 2 },
      { name: 'ctaLabel', label: 'Bouton 1 : texte', type: 'text' }, { name: 'ctaHref', label: 'Bouton 1 : lien (ex. /marketplace)', type: 'text' },
      { name: 'cta2Label', label: 'Bouton 2 : texte', type: 'text' }, { name: 'cta2Href', label: 'Bouton 2 : lien', type: 'text' },
      { name: 'overlay', label: 'Assombrissement de l’image (0 à 90)', type: 'number', help: '55 recommandé pour une bonne lisibilité du texte' },
      { name: 'align', label: 'Alignement du texte', type: 'select', options: [{ value: 'left', label: 'À gauche' }, { value: 'center', label: 'Centré' }] },
      { name: 'isActive', label: 'Afficher cette bannière', type: 'boolean' },
    ],
    actions: toggleActive.slice(0, 2),
  },
  hotels: {
    key: 'hotels', label: 'Hôtels & hébergements', singular: 'hébergement', publicPath: '/hotels',
    columns: [{ key: 'name', label: 'Établissement' }, { key: 'type', label: 'Type', kind: 'badge' }, { key: 'city', label: 'Ville' }, { key: 'ownerName', label: 'Propriétaire' }, { key: 'status', label: 'Statut', kind: 'badge' }, { key: 'updatedAt', label: 'Mis à jour', kind: 'date' }],
    searchFields: ['name', 'city', 'ownerName'], statusField: 'status', statuses: listingStatuses, canDelete: true,
    actions: [
      { key: 'approve', label: 'Approuver', tone: 'good', set: { status: 'approved', isActive: true, publishedAt: '$now' }, show: is('status', 'pending', 'needs_correction', 'rejected', 'suspended'), notify: 'a été approuvé et est maintenant visible publiquement.' },
      { key: 'correct', label: 'À corriger', tone: 'warn', set: { status: 'needs_correction', isActive: false }, needsNote: true, noteField: 'correctionRequest', show: is('status', 'pending'), notify: 'nécessite une correction :' },
      { key: 'reject', label: 'Refuser', tone: 'bad', set: { status: 'rejected', isActive: false }, needsNote: true, noteField: 'rejectionReason', show: is('status', 'pending', 'needs_correction'), notify: 'a été refusé :' },
      { key: 'suspend', label: 'Suspendre', tone: 'bad', set: { status: 'suspended', isActive: false }, needsNote: true, noteField: 'adminNote', show: is('status', 'approved'), notify: 'a été suspendu :' },
      { key: 'feature', label: 'Mettre en avant', tone: 'neutral', set: { isFeatured: true }, show: (r) => r.status === 'approved' && !r.isFeatured },
      { key: 'unfeature', label: 'Retirer la mise en avant', tone: 'neutral', set: { isFeatured: false }, show: (r) => !!r.isFeatured },
    ],
  },
  restaurants: {
    key: 'restaurants', label: 'Restaurants', singular: 'restaurant', canCreate: true, canDelete: true, publicPath: '/restaurants', slugFrom: 'name',
    columns: [{ key: 'name', label: 'Restaurant' }, { key: 'cuisineType', label: 'Cuisine' }, { key: 'city', label: 'Ville' }, { key: 'ownerId.name', label: 'Propriétaire' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['name', 'cuisineType', 'city'], statusField: 'status', statuses: listingStatuses, fields: LISTING_CONFIG.restaurant.fields, actions: moderation('adminNote'),
  },
  services: {
    key: 'services', label: 'Entreprises & services', singular: 'service', canCreate: true, canDelete: true, publicPath: '/services', slugFrom: 'name',
    columns: [{ key: 'name', label: 'Entreprise' }, { key: 'category', label: 'Catégorie' }, { key: 'city', label: 'Ville' }, { key: 'ownerId.name', label: 'Propriétaire' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['name', 'category', 'city'], statusField: 'status', statuses: listingStatuses, fields: LISTING_CONFIG.service.fields, actions: moderation('adminNote'),
  },
  tourism: {
    key: 'tourism', label: 'Sites touristiques', singular: 'site touristique', canCreate: true, canDelete: true, publicPath: '/tourism', slugFrom: 'name',
    columns: [{ key: 'name', label: 'Site' }, { key: 'category', label: 'Catégorie', kind: 'badge' }, { key: 'city', label: 'Ville' }, { key: 'ownerId.name', label: 'Propriétaire' }, { key: 'status', label: 'Statut', kind: 'badge' }],
    searchFields: ['name', 'city'], statusField: 'status', statuses: listingStatuses, fields: LISTING_CONFIG.tourism.fields, actions: moderation('adminNote'),
  },
};

/** Les 4 types soumis à validation, regroupés dans « Publications ». */
export const PUBLICATION_TABS = ['hotels', 'restaurants', 'services', 'tourism', 'shops', 'products', 'events'] as const;
