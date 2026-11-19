import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireUser } from '@/lib/guards';
import { Shop } from '@/models/Shop';
import { sanitizeFields, slugify } from '@/lib/listings';
import { productFields } from '@/lib/vendor-config';
import { isValidObjectId } from '@/lib/security';
import { notifyAdmins } from '@/lib/support';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Number(searchParams.get('limit')) || ITEMS_PER_PAGE);
    const category = searchParams.get('category');
    const shop = searchParams.get('shop');
    const search = searchParams.get('q');
    const featured = searchParams.get('featured');

    const filter: Record<string, unknown> = { status: 'active' };
    if (category) filter.categoryId = category;
    if (shop) filter.shopId = shop;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('shopId', 'name slug logo')
        .populate('categoryId', 'name slug'),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(['vendor']);
    if ('error' in auth) return auth.error;
    const shop = await Shop.findOne({ ownerId: auth.user.userId }).select('_id status');
    if (!shop) return NextResponse.json({ success: false, error: 'Créez d’abord votre boutique' }, { status: 400 });
    if (shop.status === 'suspended' || shop.status === 'rejected') return NextResponse.json({ success: false, error: 'Votre boutique n’est pas active' }, { status: 403 });

    const { data, error } = sanitizeFields(productFields(), await req.json().catch(() => ({})));
    if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
    if (!isValidObjectId(String(data.categoryId))) return NextResponse.json({ success: false, error: 'Catégorie invalide' }, { status: 400 });
    // Propriétaire, boutique et statut sont décidés par le serveur
    const product = await Product.create({ ...data, slug: slugify(String(data.name)), shopId: shop._id, status: 'pending' });
    await notifyAdmins('Nouveau produit à valider', String(data.name), '/admin/products');
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
