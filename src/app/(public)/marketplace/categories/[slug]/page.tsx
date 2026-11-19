import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace-categories';
import { getSiteImageMap } from '@/lib/site-images';
import { ProductGrid } from '@/components/marketplace/ProductGrid';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = MARKETPLACE_CATEGORIES.find((x) => x.slug === (await params).slug);
  return { title: c?.name ?? 'Catégorie', description: c?.description };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const meta = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
  await connectDB();
  const db = await Category.findOne({ slug }).lean();
  if (!meta && !db) notFound();
  const name = meta?.name ?? db!.name;
  const products = db ? await Product.find({ categoryId: db._id, status: 'active' }).sort({ isFeatured: -1, createdAt: -1 }).limit(48).lean() : [];
  const img = (await getSiteImageMap())[`marketplace.cat.${slug}`]?.url;
  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-white/10">
        {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover -z-10" />}
        <div className={`${img ? 'bg-black/60' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 py-14">
            <Link href="/marketplace" className="text-sm text-emerald-light hover:underline">← Marketplace</Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-3">{name}</h1>
            <p className="text-white/80 mt-3 max-w-2xl">{meta?.description ?? db?.description}</p>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <ProductGrid products={JSON.parse(JSON.stringify(products))} emptyMessage="Aucun produit dans cette catégorie pour le moment." />
        <div className="rounded-xl border border-white/10 bg-night-light p-6 text-center">
          <p className="text-white font-semibold">Vous produisez ou vendez dans cette catégorie ?</p>
          <Link href="/auth/register" className="inline-block mt-3 px-5 py-2.5 rounded-md bg-gold text-night font-semibold hover:bg-gold-light">Publier mes produits</Link>
        </div>
      </div>
    </div>
  );
}
