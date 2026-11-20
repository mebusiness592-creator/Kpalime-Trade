import type { FieldDef } from '@/lib/listing-config';

export const SHOP_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Nom de la boutique / entreprise', type: 'text', required: true, col: 2 },
  { name: 'description', label: 'Présentation', type: 'textarea', required: true, col: 2 },
  { name: 'address', label: 'Adresse', type: 'text', required: true }, { name: 'city', label: 'Ville', type: 'text' },
  { name: 'district', label: 'Quartier', type: 'text' }, { name: 'phone', label: 'Téléphone', type: 'text', required: true },
  { name: 'whatsapp', label: 'WhatsApp', type: 'text' }, { name: 'email', label: 'E-mail', type: 'email' },
  { name: 'categoryId', label: 'Activité principale', type: 'select', taxonomy: 'product', help: 'Facultatif : votre type de boutique est aussi détecté automatiquement à partir de vos produits.' },
  { name: 'openingHours', label: 'Horaires', type: 'text', col: 2 },
  { name: 'logo', label: 'Logo', type: 'image' }, { name: 'banner', label: 'Bannière', type: 'image' },
];

export const productFields = (categories: { value: string; label: string }[] = []): FieldDef[] => [
  { name: 'name', label: 'Nom du produit', type: 'text', required: true, col: 2 },
  { name: 'categoryId', label: 'Catégorie du produit', type: 'select', required: true, taxonomy: 'product', options: categories.length ? categories : undefined },
  { name: 'stock', label: 'Quantité disponible', type: 'number', required: true },
  { name: 'price', label: 'Prix (FCFA)', type: 'number', required: true }, { name: 'discountPrice', label: 'Prix promotionnel', type: 'number' },
  { name: 'description', label: 'Description détaillée', type: 'textarea', required: true, col: 2 },
  { name: 'images', label: 'Photos du produit', type: 'gallery', col: 2 },
];
