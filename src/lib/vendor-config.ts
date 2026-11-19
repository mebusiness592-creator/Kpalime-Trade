import type { FieldDef } from '@/lib/listing-config';

export const SHOP_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Nom de la boutique / entreprise', type: 'text', required: true, col: 2 },
  { name: 'description', label: 'Présentation', type: 'textarea', required: true, col: 2 },
  { name: 'address', label: 'Adresse', type: 'text', required: true }, { name: 'city', label: 'Ville', type: 'text' },
  { name: 'district', label: 'Quartier', type: 'text' }, { name: 'phone', label: 'Téléphone', type: 'text', required: true },
  { name: 'whatsapp', label: 'WhatsApp', type: 'text' }, { name: 'email', label: 'E-mail', type: 'email' },
  { name: 'openingHours', label: 'Horaires', type: 'text', col: 2 },
  { name: 'logo', label: 'Logo', type: 'image' }, { name: 'banner', label: 'Bannière', type: 'image' },
];

export const productFields = (categories: { value: string; label: string }[] = []): FieldDef[] => [
  { name: 'name', label: 'Nom du produit', type: 'text', required: true, col: 2 },
  categories.length ? { name: 'categoryId', label: 'Catégorie', type: 'select', required: true, options: categories } : { name: 'categoryId', label: 'Catégorie', type: 'text', required: true },
  { name: 'stock', label: 'Quantité disponible', type: 'number', required: true },
  { name: 'price', label: 'Prix (FCFA)', type: 'number', required: true }, { name: 'discountPrice', label: 'Prix promotionnel', type: 'number' },
  { name: 'description', label: 'Description détaillée', type: 'textarea', required: true, col: 2 },
  { name: 'images', label: 'Photos du produit', type: 'gallery', col: 2 },
];
