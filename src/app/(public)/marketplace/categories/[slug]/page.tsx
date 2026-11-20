import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { getSiteImageMap } from '@/lib/site-images';
import { shopCategoryMap, pageParams, PAGE_SIZE } from '@/lib/public-data';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { PageHero, EntityCard, Pager, Empty } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const c = await Category.findOne({ slug }).lean();
  return { title: c?.name ?? 'Catégorie', description: c?.description };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await pageParams(searchParams);
  await connectDB();
  const cat = await Category.findOne({ slug, isActive: true }).lean();
  if (!cat) notFound();
  const filter = { categoryId: cat._id, status: 'active' };
  const map = await shopCategoryMap();
  const shopIds = [...map].filter(([, c]) => c === String(cat._id)).map(([s]) => s);
  const [total, products, shops, images] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).populate('shopId', 'name slug').lean(),
    Shop.find({ _id: { $in: shopIds }, status: 'approved' }).limit(8).lean(),
    getSiteImageMap(),
  ]);
  return (
    <div>
      <PageHero title={cat.name} subtitle={cat.description} image={images[`marketplace.cat.${slug}`]?.url || cat.image}>
        <Link href="/marketplace" className="text-sm text-gold hover:underline">← Marketplace</Link>
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {shops.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between"><h2 className="text-2xl font-bold text-white">Fournisseurs : {cat.name}</h2><Link href={`/shops?category=${slug}`} className="text-sm text-emerald-light hover:underline">Voir tous →</Link></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{shops.map((s) => <EntityCard key={String(s._id)} href={`/shops/${s.slug}`} image={s.logo} title={s.name} subtitle={s.city} text={s.description} />)}</div>
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Produits ({total})</h2>
          {total === 0 ? <Empty text="Aucun produit dans cette catégorie pour le moment." cta={{ href: '/auth/register', label: 'Publier mes produits' }} /> : <ProductGrid products={JSON.parse(JSON.stringify(products))} />}
          <Pager base={`/marketplace/categories/${slug}`} page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{}} />
        </section>
      </div>
    </div>
  );
}
