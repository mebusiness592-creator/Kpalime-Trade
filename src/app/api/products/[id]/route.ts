import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireUser } from '@/lib/guards';
import { Shop } from '@/models/Shop';
import { sanitizeFields } from '@/lib/listings';
import { productFields } from '@/lib/vendor-config';
import { isValidObjectId } from '@/lib/security';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id)
      .populate('shopId', 'name slug logo phone whatsapp')
      .populate('categoryId', 'name slug');

    if (!product) return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 });

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

async function owned(id: string) {
  const auth = await requireUser(['vendor']);
  if ('error' in auth) return { res: auth.error };
  if (!isValidObjectId(id)) return { res: NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 }) };
  const shop = await Shop.findOne({ ownerId: auth.user.userId }).select('_id');
  const product = shop ? await Product.findOne({ _id: id, shopId: shop._id }) : null;
  if (!product) return { res: NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 }) };
  return { product };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const r = await owned((await params).id);
  if ('res' in r) return r.res;
  const { data, error } = sanitizeFields(productFields(), await req.json().catch(() => ({})), true);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
  const sensitive = ['name', 'description', 'images'].some((k) => k in data && JSON.stringify(data[k]) !== JSON.stringify(r.product.get(k)));
  r.product.set(data);
  if (r.product.status === 'active' && sensitive) r.product.status = 'pending'; // re-validation
  await r.product.save();
  return NextResponse.json({ success: true, data: r.product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const r = await owned((await params).id);
  if ('res' in r) return r.res;
  await r.product.deleteOne();
  return NextResponse.json({ success: true });
}
