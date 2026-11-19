import Link from 'next/link';
import { HeroCarousel, type Slide } from '@/components/home/HeroCarousel';
import { getHeroSlides } from '@/lib/site-config';
import {
  ShoppingBag,
  Palmtree,
  Building2,
  Search,
  ArrowRight,
  Globe,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Hotel,
  UtensilsCrossed,
  CalendarDays,
  Palette,
  Wrench,
  Users,
  FileText,
  MessageCircle,
  Store,
  Briefcase,
  Handshake,
  Sparkles,
  Coffee,
  Shirt,
  Wheat,
} from 'lucide-react';

const APP_NAME = 'Kpalimé-Trade';

// Accès rapides "Que recherchez-vous ?"
const QUICK_LINKS = [
  { name: 'Produits agricoles', href: '/marketplace', icon: Wheat, color: 'from-emerald-brand/20 to-emerald-brand/5' },
  { name: 'Entreprises', href: '/services', icon: Building2, color: 'from-blue-500/20 to-blue-500/5' },
  { name: 'Hôtels', href: '/hotels', icon: Hotel, color: 'from-gold/20 to-gold/5' },
  { name: 'Restaurants', href: '/restaurants', icon: UtensilsCrossed, color: 'from-orange-500/20 to-orange-500/5' },
  { name: 'Tourisme', href: '/tourism', icon: Palmtree, color: 'from-emerald-brand/20 to-emerald-brand/5' },
  { name: 'Services', href: '/services', icon: Wrench, color: 'from-cyan-500/20 to-cyan-500/5' },
  { name: 'Événements', href: '/events', icon: CalendarDays, color: 'from-pink-500/20 to-pink-500/5' },
  { name: 'Culture', href: '/culture', icon: Palette, color: 'from-purple-500/20 to-purple-500/5' },
];

// Exemples de produits du Togo (non limitatifs)
const TOGO_PRODUCTS = [
  { name: 'Café', icon: Coffee, slug: '/marketplace' },
  { name: 'Cacao', icon: Wheat, slug: '/marketplace' },
  { name: 'Coton', icon: Shirt, slug: '/marketplace' },
  { name: 'Artisanat', icon: Palette, slug: '/marketplace' },
  { name: 'Textile', icon: Shirt, slug: '/marketplace' },
  { name: 'Produits agricoles', icon: Wheat, slug: '/marketplace' },
];

export const dynamic = 'force-dynamic';

const DEFAULT_SLIDES: Slide[] = [
  { _id: 'default-1', eyebrow: 'Plateforme commerciale & économique', title: 'Les richesses locales vers le monde entier', subtitle: `${APP_NAME} connecte producteurs, entreprises, hébergements, services et acheteurs, du Togo au marché international.`, ctaLabel: 'Explorer les produits', ctaHref: '/marketplace', cta2Label: 'Découvrir le Togo', cta2Href: '/discover', overlay: 40, align: 'left' },
];

export default async function HomePage() {
  const slides = (await getHeroSlides()) as unknown as Slide[];
  return (
    <div className="bg-night min-h-screen">
      <HeroCarousel slides={slides.length ? slides : DEFAULT_SLIDES} />

      {/* ============================================
          2. LES 3 PÔLES — Explorez Kpalimé-Trade
      ============================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Explorez {APP_NAME}
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Trois grandes portes d'entrée vers l'écosystème économique et culturel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pôle 1 — Marketplace */}
            <div className="group relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-emerald-brand/10 to-night-light p-8 hover:border-emerald-brand/50 transition-all">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-md bg-emerald-brand/20 flex items-center justify-center mb-5">
                  <ShoppingBag size={28} className="text-emerald-brand" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Marketplace</h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Découvrez des produits du Togo et d'ailleurs, trouvez des fournisseurs et développez vos opportunités commerciales.
                </p>
                <Link
                  href="/marketplace"
                  prefetch
                  className="inline-flex items-center gap-2 text-emerald-brand font-semibold hover:gap-3 transition-all"
                >
                  Explorer les produits <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Pôle 2 — Découvrir le Togo */}
            <div className="group relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-gold/10 to-night-light p-8 hover:border-gold/50 transition-all">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-md bg-gold/20 flex items-center justify-center mb-5">
                  <Palmtree size={28} className="text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Découvrir le Togo</h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Explorez les destinations, la culture, le tourisme, les arts, l'artisanat et les expériences du Togo.
                </p>
                <Link
                  href="/discover"
                  prefetch
                  className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
                >
                  Découvrir le Togo <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Pôle 3 — Entreprises & Services */}
            <div className="group relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-blue-500/10 to-night-light p-8 hover:border-blue-500/50 transition-all">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-md bg-blue-500/20 flex items-center justify-center mb-5">
                  <Building2 size={28} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Entreprises & Services</h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Trouvez des entreprises, des professionnels, des fournisseurs et des services adaptés à vos besoins.
                </p>
                <Link
                  href="/services"
                  prefetch
                  className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:gap-3 transition-all"
                >
                  Explorer les entreprises & services <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          3. QUE RECHERCHEZ-VOUS ? (Accès rapides)
      ============================================ */}
      <section className="py-16 md:py-20 bg-night-light/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Que recherchez-vous ?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Accédez rapidement aux principales catégories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch
                  className={`group relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br ${link.color} p-5 hover:border-emerald-brand/50 hover:-translate-y-1 transition-all duration-300 touch-target`}
                >
                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-emerald-brand group-hover:scale-110 transition-all duration-300">
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {link.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-emerald-brand/0 group-hover:bg-emerald-brand/10 transition-all duration-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          4. PRODUITS DU TOGO (exemples)
      ============================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                Découvrez les produits du Togo
                <span className="h-1 w-12 bg-gold rounded-full" />
              </h2>
              <p className="text-muted mt-2">
                Quelques exemples de richesses locales (liste non exhaustive)
              </p>
            </div>
            <Link
              href="/marketplace"
              prefetch
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light transition-colors"
            >
              Voir tous les produits <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOGO_PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Link
                  key={product.name}
                  href={product.slug}
                  prefetch
                  className="flex flex-col items-center gap-3 p-5 rounded-md bg-night-light border border-white/10 hover:border-gold hover:-translate-y-1 transition-all touch-target"
                >
                  <Icon size={28} className="text-emerald-brand" />
                  <span className="text-white font-medium text-sm text-center">
                    {product.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/marketplace"
              prefetch
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-emerald-brand text-white font-semibold hover:bg-emerald-light transition-colors"
            >
              Voir tous les produits <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          5. OPPORTUNITÉS COMMERCIALES
      ============================================ */}
      <section className="py-16 md:py-20 bg-night-light/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Opportunités commerciales
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Plus qu'une boutique : une plateforme de mise en relation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-md border border-white/10 bg-night p-6 hover:border-emerald-brand/50 transition-all">
              <div className="w-12 h-12 rounded-md bg-emerald-brand/20 flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-emerald-brand" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Acheter</h3>
              <p className="text-muted text-sm leading-relaxed">
                Trouvez les produits dont vous avez besoin auprès de vendeurs vérifiés.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-night p-6 hover:border-gold/50 transition-all">
              <div className="w-12 h-12 rounded-md bg-gold/20 flex items-center justify-center mb-4">
                <Users size={24} className="text-gold" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Trouver un fournisseur</h3>
              <p className="text-muted text-sm leading-relaxed">
                Identifiez des producteurs et fournisseurs pour vos besoins commerciaux.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-night p-6 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-md bg-blue-500/20 flex items-center justify-center mb-4">
                <FileText size={24} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Demander un devis</h3>
              <p className="text-muted text-sm leading-relaxed">
                Envoyez une demande personnalisée pour vos besoins commerciaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          6. SECTION PROFESSIONNELS
      ============================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-md bg-gradient-to-br from-emerald-brand/20 via-night-light to-gold/10 border border-emerald-brand/30 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-brand/20 text-emerald-brand text-xs font-semibold uppercase tracking-wider mb-3">
                <Briefcase size={14} />
                Espace professionnels
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Développez votre activité avec {APP_NAME}
              </h2>
              <p className="text-muted max-w-xl">
                Présentez votre entreprise, vos produits ou vos services et développez votre visibilité auprès de nouveaux clients et partenaires au Togo et à l'international.
              </p>
            </div>
            <Link
              href="/auth/register"
              prefetch
              className="touch-target inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gold text-night font-semibold hover:bg-gold-light transition-all shadow-lg shadow-gold/25 shrink-0"
            >
              Rejoindre {APP_NAME}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          7. VISION INTERNATIONALE
      ============================================ */}
      <section className="py-16 md:py-20 bg-night-light/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Globe size={48} className="text-emerald-brand mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Du Togo vers le monde
          </h2>
          <p className="text-muted text-lg max-w-3xl mx-auto leading-relaxed">
            Les produits, entreprises et opportunités du Togo ouverts au monde.
            Une plateforme en évolution, pensée pour connecter le local à l'international.
          </p>
        </div>
      </section>
    </div>
  );
}