import { NextResponse, type NextRequest } from 'next/server';
import { Shop } from '@/models/Shop';
import { requireUser } from '@/lib/guards';
import { SHOP_FIELDS } from '@/lib/vendor-config';
import { sanitizeFields } from '@/lib/listings';

export async function GET() {
  const auth = await requireUser(['vendor']);
  if ('error' in auth) return auth.error;
  const shop = await Shop.findOne({ ownerId: auth.user.userId }).lean();
  return NextResponse.json({ success: true, data: shop });
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser(['vendor']);
  if ('error' in auth) return auth.error;
  const { data, error } = sanitizeFields(SHOP_FIELDS, await req.json().catch(() => ({})), true);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
  const shop = await Shop.findOneAndUpdate({ ownerId: auth.user.userId }, { $set: data }, { new: true });
  if (!shop) return NextResponse.json({ success: false, error: 'Boutique introuvable' }, { status: 404 });
  return NextResponse.json({ success: true, data: shop });
}
