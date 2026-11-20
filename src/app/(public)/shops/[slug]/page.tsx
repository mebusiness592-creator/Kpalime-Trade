import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { getTaxonomy } from '@/lib/taxonomy';
import { shopCategoryMap, pageParams, PAGE_SIZE } from '@/lib/public-data';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { FavoriteButton } from '@/components/inquiry/FavoriteButton';
import { ContactButtons, CategoryChips, Pager } from '@/components/public/blocks';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const s = await Shop.findOne({ slug, status: 'approved' }).lean();
  return s ? { title: s.name, description: String(s.description).slice(0, 150) } : { title: 'Boutique introuvable' };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { category, page } = await pageParams(searchParams);
  await connectDB();
  const shop = await Shop.findOne({ slug, status: 'approved' }).lean();
  if (!shop) notFound();
  const cats = await getTaxonomy('product');
  const cat = cats.find((c) => c.slug === category);
  const base = { shopId: shop._id, status: 'active' };
  const filter = cat ? { ...base, categoryId: cat.value } : base;
  const [total, products, used, map] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).populate('shopId', 'name slug').lean(),
    Product.distinct('categoryId', base),
    shopCategoryMap(),
  ]);
  const myType = cats.find((c) => c.value === map.get(String(shop._id)));
  const s = JSON.parse(JSON.stringify(shop));
  return (
    <div>
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-night-light to-emerald-brand/30 overflow-hidden">
        {s.banner && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.banner} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative space-y-10 pb-12">
        <div className="flex flex-col md:flex-row gap-5 md:items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.logo || PLACEHOLDER_IMG} alt={s.name} className="w-28 h-28 rounded-xl object-cover border-4 border-night bg-night-light" />
          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-white">{s.name}</h1>
            <p className="text-sm text-muted">{[s.address, s.district, s.city].filter(Boolean).join(' · ')}</p>
            {myType && <Link href={`/shops?category=${myType.slug}`} className="inline-block px-3 py-1 rounded-full bg-gold/15 text-gold text-xs">{myType.label}</Link>}
          </div>
          <FavoriteButton targetType="shop" targetId={s._id} name={s.name} path={`/shops/${s.slug}`} image={s.logo} />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white">À propos</h2>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{s.description}</p>
            {s.openingHours && <p className="text-sm text-muted">Horaires : {s.openingHours}</p>}
            <ContactButtons phone={s.phone} whatsapp={s.whatsapp} email={s.email} />
          </div>
          <InquiryForm targetType="shop" targetId={s._id} targetName={s.name} />
        </div>
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Produits ({total})</h2>
          <CategoryChips base={`/shops/${slug}`} active={category} items={cats.filter((c) => used.map(String).includes(c.value)).map((c) => ({ value: c.slug, label: c.label }))} />
          <ProductGrid products={JSON.parse(JSON.stringify(products))} emptyMessage="Cette boutique n’a pas encore de produit publié." />
          <Pager base={`/shops/${slug}`} page={page} pages={Math.ceil(total / PAGE_SIZE)} params={category ? { category } : {}} />
        </section>
      </div>
    </div>
  );
}
