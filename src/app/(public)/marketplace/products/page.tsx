import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getTaxonomy } from '@/lib/taxonomy';
import { getSiteImageMap } from '@/lib/site-images';
import { pageParams, regex, PAGE_SIZE } from '@/lib/public-data';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { PageHero, SearchBar, CategoryChips, Pager } from '@/components/public/blocks';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Tous les produits' };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, category, sort, page } = await pageParams(searchParams);
  await connectDB();
  const cats = await getTaxonomy('product');
  const cat = cats.find((c) => c.slug === category);
  const filter: Record<string, unknown> = { status: 'active' };
  if (q) filter.name = regex(q);
  if (cat) filter.categoryId = cat.value;
  const order = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { isFeatured: -1, createdAt: -1 };
  const [total, rows, images] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(order as never).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).populate('shopId', 'name slug').lean(),
    getSiteImageMap(),
  ]);
  return (
    <div>
      <PageHero title="Tous les produits" subtitle={`${total} produit(s)${cat ? ` · ${cat.label}` : ''}`} image={images['page.marketplace.banner']?.url}>
        <SearchBar action="/marketplace/products" q={q} category={category} placeholder="Rechercher un produit…" />
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CategoryChips base="/marketplace/products" items={cats.map((c) => ({ value: c.slug, label: c.label }))} active={category} q={q} />
        <div className="flex gap-2 text-sm text-muted items-center">Trier :
          {[['', 'Pertinence'], ['price_asc', 'Prix croissant'], ['price_desc', 'Prix décroissant']].map(([v, l]) => (
            <a key={v} href={`/marketplace/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(v ? { sort: v } : {}) })}`} className={sort === v || (!sort && !v) ? 'text-gold' : 'hover:text-white'}>{l}</a>
          ))}
        </div>
        <ProductGrid products={JSON.parse(JSON.stringify(rows))} emptyMessage="Aucun produit ne correspond à votre recherche." />
        <Pager base="/marketplace/products" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(sort ? { sort } : {}) }} />
      </div>
    </div>
  );
}
