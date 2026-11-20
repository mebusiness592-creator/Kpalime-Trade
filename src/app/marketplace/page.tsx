import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { getTaxonomy } from '@/lib/taxonomy';
import { getSiteImageMap } from '@/lib/site-images';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { PageHero, SearchBar, EntityCard, Empty } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Marketplace', description: 'Produits locaux et fournisseurs du Togo : producteurs, boutiques et entreprises.' };

export default async function MarketplacePage() {
  await connectDB();
  const [categories, images, latest, shops] = await Promise.all([
    getTaxonomy('product'), getSiteImageMap(),
    Product.find({ status: 'active' }).sort({ isFeatured: -1, createdAt: -1 }).limit(8).populate('shopId', 'name slug').lean(),
    Shop.find({ status: 'approved' }).sort({ isFeatured: -1, createdAt: -1 }).limit(4).lean(),
  ]);
  return (
    <div>
      <PageHero title="Marketplace" subtitle="Découvrez les produits des producteurs, commerçants et entreprises du Togo, et contactez-les directement." image={images['page.marketplace.banner']?.url}>
        <SearchBar action="/marketplace/products" placeholder="Rechercher un produit (ex. café, huile, tissu…)" />
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        <section className="space-y-5">
          <div className="flex items-end justify-between"><h2 className="text-2xl font-bold text-white">Catégories</h2><Link href="/marketplace/products" className="text-sm text-emerald-light hover:underline">Tous les produits →</Link></div>
          {categories.length === 0 ? <Empty text="Les catégories seront bientôt disponibles." /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((c) => <EntityCard key={c.value} href={`/marketplace/categories/${c.slug}`} image={images[`marketplace.cat.${c.slug}`]?.url || c.image} title={c.label} text={c.description} />)}
            </div>
          )}
        </section>
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Produits récents</h2>
          <ProductGrid products={JSON.parse(JSON.stringify(latest))} emptyMessage="Les premiers produits arrivent bientôt." />
        </section>
        <section className="space-y-5">
          <div className="flex items-end justify-between"><h2 className="text-2xl font-bold text-white">Boutiques & fournisseurs</h2><Link href="/shops" className="text-sm text-emerald-light hover:underline">Voir toutes les boutiques →</Link></div>
          {shops.length === 0 ? <Empty text="Aucune boutique pour le moment." cta={{ href: '/auth/register', label: 'Ouvrir ma boutique' }} /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{shops.map((s) => <EntityCard key={String(s._id)} href={`/shops/${s.slug}`} image={s.logo} title={s.name} subtitle={[s.city, s.district].filter(Boolean).join(' · ')} text={s.description} />)}</div>
          )}
        </section>
        <section className="rounded-xl border border-white/10 bg-night-light p-8 text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">Vous produisez ou vendez ?</h2>
          <p className="text-muted">Ouvrez votre boutique gratuitement et présentez vos produits aux acheteurs du Togo et du monde.</p>
          <Link href="/auth/register" className="inline-block px-6 py-3 rounded-md bg-gold text-night font-semibold hover:bg-gold-light">Devenir vendeur</Link>
        </section>
      </div>
    </div>
  );
}
