import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Shop } from '@/models/Shop';
import { requireUser } from '@/lib/guards';
import { SHOP_FIELDS } from '@/lib/vendor-config';
import { sanitizeFields, slugify } from '@/lib/listings';
import { notifyAdmins } from '@/lib/support';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const status = new URL(req.url).searchParams.get('status');
    // Seul l'admin peut lister d'autres statuts que « approved »
    let filter: Record<string, unknown> = { status: 'approved' };
    if (status && status !== 'approved') {
      const auth = await requireUser(['admin']);
      if ('error' in auth) return auth.error;
      filter = { status };
    }
    const shops = await Shop.find(filter).sort({ isFeatured: -1, createdAt: -1 }).populate('ownerId', 'name');
    return NextResponse.json({ success: true, data: shops });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(['vendor']);
  if ('error' in auth) return auth.error;
  if (await Shop.findOne({ ownerId: auth.user.userId })) return NextResponse.json({ success: false, error: 'Vous avez déjà une boutique' }, { status: 409 });
  const { data, error } = sanitizeFields(SHOP_FIELDS, await req.json().catch(() => ({})));
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
  const shop = await Shop.create({ city: 'Kpalimé', ...data, slug: slugify(String(data.name)), ownerId: auth.user.userId, status: 'pending' });
  await notifyAdmins('Nouvelle boutique à valider', String(data.name), '/admin/shops');
  return NextResponse.json({ success: true, data: shop }, { status: 201 });
}
