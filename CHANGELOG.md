# 📋 Changelog

## [Non publié] — Administration, images, comptes, assistance

- Suppression de GitHub Actions (`.github/`).
- Middleware réécrit avec `jose` (compatible Edge) ; vérification serveur du rôle admin dans le layout.
- `AUTH_SECRET` obligatoire en production (plus de secret par défaut).
- Nouveaux types de comptes : hébergement, restaurateur, prestataire, site touristique / guide.
- Images administrables : menu « Images du site » + médiathèque (Cloudinary), emplacements définis dans `src/lib/site-images.ts`.
- Assistance : tickets, messagerie utilisateur ↔ admin, notifications, statuts.
- Images : envoi direct navigateur → Cloudinary (signature serveur), plus de limite de taille Vercel ; ~190 emplacements administrables + emplacements personnalisés + médiathèque.
- Bannière d'accueil (diaporama image + texte) et thème/paramètres du site (couleurs, logo, contacts, bandeau d'annonce) modifiables depuis l'admin.
- Navigation et pied de page redessinés (menus par univers).
- Admin : gestionnaire générique (recherche, filtres, actions, messages de correction, notifications) pour utilisateurs, boutiques, produits, catégories, commandes, devises, événements, culture, artisans, guides, avis, signalements, hôtels, restaurants, services, tourisme, bannières, contacts.
- Espaces professionnels : restaurateur, prestataire, tourisme (création, brouillon, soumission, validation) ; boutique et produits vendeur corrigés.
- Demandes/devis/réservations visiteur → professionnel, favoris, profil, contact, pages produit, catégories et régions, CGU/confidentialité.
- Catégories et types gérés depuis l'admin (produits, boutiques, services, tourisme, cuisines, événements, culture) ; plus aucune liste figée dans le code ; détection automatique de la catégorie (mots-clés) et du type de boutique (produits dominants).
- Plus aucune image dans les fichiers du projet (tout sur Cloudinary).
- Pages publiques reconstruites : Marketplace, produits, catégories, boutiques & fournisseurs, fiche boutique, services, sites touristiques (recherche, filtres, pagination, favoris, devis).
- Admin : bouton « Détails » affichant toutes les informations saisies par l'utilisateur.
- Sécurité : suppression des identifiants de test codés en dur, routes hébergements/admin/seed protégées côté serveur.

## [1.0.0] - 2026-09-25

### 🎉 Version initiale complète

#### Marketplace
- ✅ Inscription et gestion des vendeurs
- ✅ Création et gestion des boutiques
- ✅ CRUD produits avec upload images Cloudinary
- ✅ Catégories de produits
- ✅ Panier d'achat avec persistance localStorage
- ✅ Passage de commande
- ✅ Paiement à la livraison (COD)
- ✅ Structure paiement Mobile Money prête pour agrégateur
- ✅ Historique des commandes client
- ✅ Suivi des commandes

#### Multi-devises
- ✅ Support XOF (FCFA), USD, EUR
- ✅ Conversion automatique des prix
- ✅ Sélecteur de devise utilisateur
- ✅ Taux de change gérables par admin
- ✅ Affichage formaté par devise

#### Tourisme
- ✅ Sites touristiques avec fiches détaillées
- ✅ Guides touristiques avec contact direct
- ✅ Activités et informations pratiques

#### Hébergements
- ✅ Hôtels, maisons d'hôtes, auberges
- ✅ Chambres avec prix et équipements
- ✅ Formulaire de réservation via WhatsApp/Appel

#### Restaurants
- ✅ Fiches restaurants avec spécialités
- ✅ Menus détaillés par catégorie
- ✅ Contact direct

#### Culture & Artisanat
- ✅ Articles culturels
- ✅ Fiches artisans avec contact

#### Événements
- ✅ Calendrier d'événements
- ✅ Fiches détaillées avec informations pratiques

#### Services & Professionnels
- ✅ Annuaire des professionnels
- ✅ Fiches détaillées avec portfolio

#### Administration
- ✅ Dashboard avec statistiques
- ✅ Gestion utilisateurs (suspendre, réactiver)
- ✅ Gestion boutiques (valider, refuser)
- ✅ Gestion produits (approuver, masquer)
- ✅ Gestion commandes (suivi statuts)
- ✅ Gestion devises
- ✅ Gestion tourisme, hôtels, restaurants
- ✅ Gestion culture, événements, services
- ✅ Signalements et modération
- ✅ Gestion des avis
- ✅ Journal d'audit
- ✅ Paramètres plateforme

#### Utilisateurs
- ✅ Authentification complète (inscription, connexion, déconnexion)
- ✅ Rôles : client, vendeur, professionnel, admin
- ✅ Espace client (commandes, profil, notifications)
- ✅ Espace vendeur (produits, commandes, stats, boutique)
- ✅ Notifications in-app

#### Technique
- ✅ Next.js 15 App Router
- ✅ TypeScript strict
- ✅ MongoDB Atlas + Mongoose
- ✅ Cloudinary pour images/vidéos
- ✅ Tailwind CSS 4
- ✅ PWA (manifest, service worker, offline)
- ✅ SEO (sitemap, robots, Open Graph, JSON-LD)
- ✅ Sécurité (JWT, bcrypt, rate limiting, headers)
- ✅ Tests unitaires et d'intégration
- ✅ CI/CD GitHub Actions
- ✅ Déploiement Vercel + Docker

#### Performance & UX
- ✅ Mobile-first
- ✅ Navigation fluide (prefetch, transitions)
- ✅ Skeletons de chargement
- ✅ Images optimisées (AVIF/WebP)
- ✅ Bottom navigation mobile
- ✅ Recherche multi-entités
- ✅ Filtres et tri produits
- ✅ Accessibilité de base (WCAG AA)
