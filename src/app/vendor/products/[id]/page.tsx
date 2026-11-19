import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { ProductForm } from '@/components/vendor/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = (await getCurrentUser()) as { userId?: string } | null;
  if (!s?.userId) redirect('/auth/login');
  await connectDB();
  const shop = await Shop.findOne({ ownerId: s.userId }).select('_id').lean();
  const product = shop ? await Product.findOne({ _id: id, shopId: shop._id }).lean().catch(() => null) : null;
  if (!product) notFound();
  const cats = await Category.find({ isActive: true }).sort({ position: 1 }).lean();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Modifier : {product.name}</h1>
      {product.adminNote && <p className="text-sm rounded-md bg-orange-500/10 text-orange-200 p-3">Message de l’administration : {product.adminNote}</p>}
      <ProductForm categories={cats.map((c) => ({ value: String(c._id), label: c.name }))} id={id} initial={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
