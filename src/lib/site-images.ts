import { connectDB } from '@/lib/mongodb';
import { SiteImage } from '@/models/SiteImage';

export interface SiteImageSlot {
  key: string;
  label: string;
  group: string;
  fallback: string; // image par défaut livrée avec le site
}

/** Catalogue de tous les emplacements d'images administrables. Ajouter une ligne = nouveau menu dans l'admin. */
const REGIONS = [
  ['maritime', 'Maritime'], ['plateaux', 'Plateaux'], ['centrale', 'Centrale'], ['kara', 'Kara'], ['savanes', 'Savanes'],
] as const;

const PAGE_BANNERS: [string, string][] = [
  ['marketplace', 'Marketplace'], ['shops', 'Boutiques'], ['hotels', 'Hôtels & hébergements'], ['restaurants', 'Restaurants'],
  ['tourism', 'Tourisme'], ['culture', 'Culture'], ['events', 'Événements'], ['services', 'Entreprises & services'],
  ['discover', 'Découvrir le Togo'], ['search', 'Recherche'], ['about', 'À propos'], ['contact', 'Contact'],
];

const maritimeLegacy: SiteImageSlot[] = [
  { key: 'region.maritime.banner', label: 'Maritime : bannière', group: 'Région Maritime', fallback: '' },
  { key: 'region.maritime.lome', label: 'Maritime : galerie – Lomé', group: 'Région Maritime', fallback: '' },
  { key: 'region.maritime.lake', label: 'Maritime : galerie – lac Togo', group: 'Région Maritime', fallback: '' },
  { key: 'region.maritime.culture', label: 'Maritime : galerie – patrimoine', group: 'Région Maritime', fallback: '' },
  { key: 'region.maritime.hotel', label: 'Maritime : galerie – hôtel', group: 'Région Maritime', fallback: '' },
  { key: 'region.maritime.card', label: 'Maritime : vignette (page Découvrir)', group: 'Région Maritime', fallback: '' },
];

const regionSlots: SiteImageSlot[] = REGIONS.flatMap(([id, name]) => {
  const g = `Région ${name}`;
  const base: SiteImageSlot[] = id === 'maritime' ? maritimeLegacy : [
    { key: `region.${id}.banner`, label: `${name} : bannière`, group: g, fallback: '' },
    { key: `region.${id}.card`, label: `${name} : vignette (page Découvrir)`, group: g, fallback: '' },
    ...[1, 2, 3, 4, 5].map((n) => ({ key: `region.${id}.g${n}`, label: `${name} : galerie ${n}`, group: g, fallback: '' })),
  ];
  const extra = ['destinations', 'sites', 'nature', 'culture', 'hotels', 'restaurants', 'activites', 'produits']
    .map((sec) => ({ key: `region.${id}.section.${sec}`, label: `${name} : rubrique « ${sec} »`, group: g, fallback: '' }));
  return [...base, ...extra];
});

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  // Identité
  { key: 'brand.logo', label: 'Logo principal', group: 'Identité du site', fallback: '' },
  { key: 'brand.logo-light', label: 'Logo version claire (pied de page)', group: 'Identité du site', fallback: '' },
  { key: 'brand.favicon', label: 'Icône du site (favicon)', group: 'Identité du site', fallback: '' },
  { key: 'brand.og', label: 'Image de partage (réseaux sociaux)', group: 'Identité du site', fallback: '' },
  // Accueil
  { key: 'home.univers.marketplace', label: 'Accueil : carte Marketplace', group: 'Accueil', fallback: '' },
  { key: 'home.univers.explorer', label: 'Accueil : carte Explorer le Togo', group: 'Accueil', fallback: '' },
  { key: 'home.univers.services', label: 'Accueil : carte Entreprises & services', group: 'Accueil', fallback: '' },
  { key: 'home.cta.vendor', label: 'Accueil : appel « Devenir vendeur »', group: 'Accueil', fallback: '' },
  { key: 'home.cta.tourism', label: 'Accueil : appel « Promouvoir mon établissement »', group: 'Accueil', fallback: '' },
  { key: 'home.about', label: 'Accueil : section présentation', group: 'Accueil', fallback: '' },
  { key: 'home.newsletter', label: 'Accueil : fond newsletter', group: 'Accueil', fallback: '' },
  { key: 'footer.bg', label: 'Pied de page : fond', group: 'Identité du site', fallback: '' },
  // Découvrir
  { key: 'discover.carte', label: 'Découvrir : carte des régions', group: 'Découvrir le Togo', fallback: '' },
  { key: 'discover.colonne-lions', label: 'Découvrir : colonne de la Paix (lions)', group: 'Découvrir le Togo', fallback: '' },
  { key: 'discover.drapeau', label: 'Découvrir : drapeau togolais', group: 'Découvrir le Togo', fallback: '' },
  { key: 'discover.colonne-paix', label: 'Découvrir : monuments colonne de la Paix', group: 'Découvrir le Togo', fallback: '' },
  { key: 'discover.independance', label: 'Découvrir : monument de l’Indépendance', group: 'Découvrir le Togo', fallback: '' },
  ...['vegetation', 'faune', 'patrimoine', 'gastronomie', 'artisanat'].map((k) => ({ key: `discover.theme.${k}`, label: `Découvrir : thème « ${k} »`, group: 'Découvrir le Togo', fallback: '' })),
  // Régions
  ...regionSlots,
  // Bannières de pages
  ...PAGE_BANNERS.map(([k, n]) => ({ key: `page.${k}.banner`, label: `Bannière : ${n}`, group: 'Bannières des pages', fallback: '' })),
  { key: 'auth.login', label: 'Connexion : image latérale', group: 'Bannières des pages', fallback: '' },
  { key: 'auth.register', label: 'Inscription : image latérale', group: 'Bannières des pages', fallback: '' },
  // Types de comptes
  ...['client', 'vendor', 'accommodation_owner', 'restaurant_owner', 'professional', 'tourism_operator'].map((r) => ({ key: `account.${r}`, label: `Type de compte : ${r}`, group: 'Types de comptes', fallback: '' })),
  // Tourisme / culture / événements
  ...['cascade', 'montagne', 'foret', 'village', 'marche', 'culturel', 'naturel'].map((c) => ({ key: `tourism.cat.${c}`, label: `Tourisme : catégorie « ${c} »`, group: 'Tourisme', fallback: '' })),
  ...['hotel', 'auberge', 'maison-hotes', 'resort'].map((c) => ({ key: `hotels.type.${c}`, label: `Hébergement : type « ${c} »`, group: 'Hôtels & restaurants', fallback: '' })),
  ...['local', 'africain', 'international', 'street-food'].map((c) => ({ key: `restaurants.cuisine.${c}`, label: `Restaurants : cuisine « ${c} »`, group: 'Hôtels & restaurants', fallback: '' })),
  ...['agence', 'construction', 'artisan', 'transport', 'informatique', 'conseil'].map((c) => ({ key: `services.cat.${c}`, label: `Services : catégorie « ${c} »`, group: 'Entreprises & services', fallback: '' })),
];

/** Renvoie la map clé → {url, alt} stockée en base (vide si la base est indisponible). */
export async function getSiteImageMap(): Promise<Record<string, { url: string; alt?: string }>> {
  try {
    await connectDB();
    const rows = await SiteImage.find().lean();
    return Object.fromEntries(rows.map((r) => [r.key, { url: r.url, alt: r.alt }]));
  } catch {
    return {};
  }
}

/** URL à afficher pour un emplacement : image choisie par l'admin, sinon image par défaut. */
export async function getSiteImage(key: string, fallback?: string): Promise<string> {
  const map = await getSiteImageMap();
  return map[key]?.url || fallback || SITE_IMAGE_SLOTS.find((s) => s.key === key)?.fallback || '';
}
