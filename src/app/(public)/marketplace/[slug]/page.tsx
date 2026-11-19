import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { ProductImageGallery } from '@/components/marketplace/ProductImageGallery';
import { AddToCartButton } from '@/components/marketplace/AddToCartButton';
import { Price } from '@/components/currency/Price';
import { FavoriteButton } from '@/components/inquiry/FavoriteButton';
import { InquiryForm } from '@/components/inquiry/InquiryForm';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  await connectDB();
  const p = await Product.findOne({ slug, status: 'active' }).populate('shopId', 'name slug city phone whatsapp status').populate('categoryId', 'name slug').lean();
  return p ? JSON.parse(JSON.stringify(p)) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  return p ? { title: p.name, description: String(p.description).slice(0, 150) } : { title: 'Produit introuvable' };
}

export default async function ProductPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <nav className="text-sm text-muted"><Link href="/marketplace" className="hover:text-white">Marketplace</Link>{p.categoryId && <> / <Link href={`/marketplace/categories/${p.categoryId.slug}`} className="hover:text-white">{p.categoryId.name}</Link></>}</nav>
      <div className="grid md:grid-cols-2 gap-8">
        <ProductImageGallery images={p.images} alt={p.name} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{p.name}</h1>
          <div className="flex items-baseline gap-3"><Price amount={price} className="text-2xl text-gold" />{price < p.price && <span className="text-muted line-through text-sm">{p.price.toLocaleString('fr-FR')} FCFA</span>}</div>
          <p className={`text-sm ${p.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{p.stock > 0 ? `${p.stock} disponible(s)` : 'Indisponible'}</p>
          <p className="text-white/85 whitespace-pre-wrap leading-relaxed">{p.description}</p>
          {p.shopId && <p className="text-sm text-muted">Vendu par <Link href={`/shops/${p.shopId.slug}`} className="text-emerald-light hover:underline">{p.shopId.name}</Link>{p.shopId.city ? ` · ${p.shopId.city}` : ''}</p>}
          <FavoriteButton targetType="product" targetId={p._id} name={p.name} path={`/marketplace/${p.slug}`} image={p.images?.[0]?.secure_url} />
          <AddToCartButton productId={p._id} name={p.name} price={price} image={p.images?.[0]?.secure_url} stock={p.stock} />
        </div>
      </div>
      <div className="max-w-2xl"><InquiryForm targetType="product" targetId={p._id} targetName={p.name} /></div>
    </div>
  );
}
