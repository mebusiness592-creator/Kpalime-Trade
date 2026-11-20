import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/guards';
import { LISTING_CONFIG } from '@/lib/listing-config';
import { LISTING_MODELS, isListingType, sanitizeListing, slugify, autoCategory } from '@/lib/listings';

type Ctx = { params: Promise<{ type: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { type } = await params;
  if (!isListingType(type)) return NextResponse.json({ success: false, error: 'Type inconnu' }, { status: 404 });
  const auth = await requireUser([LISTING_CONFIG[type].role]);
  if ('error' in auth) return auth.error;
  const items = await LISTING_MODELS[type].find({ ownerId: auth.user.userId }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { type } = await params;
  if (!isListingType(type)) return NextResponse.json({ success: false, error: 'Type inconnu' }, { status: 404 });
  const auth = await requireUser([LISTING_CONFIG[type].role]);
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'Requête invalide' }, { status: 400 });
  const { data, error } = sanitizeListing(type, body);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
  await autoCategory(type, data);
  const submit = body.submit === true;
  const doc = await LISTING_MODELS[type].create({
    ...data, slug: slugify(String(data.name)), ownerId: auth.user.userId,
    status: submit ? 'pending' : 'draft', isActive: false, submittedAt: submit ? new Date() : undefined,
  });
  if (submit) await notifyAdminsListing(type, String(data.name), String(doc._id));
  return NextResponse.json({ success: true, data: doc }, { status: 201 });
}

async function notifyAdminsListing(type: string, name: string, id: string) {
  const { notifyAdmins } = await import('@/lib/support');
  await notifyAdmins('Nouvelle publication à valider', `${name} (${type})`, `/admin/publications?type=${type}&focus=${id}`);
}
