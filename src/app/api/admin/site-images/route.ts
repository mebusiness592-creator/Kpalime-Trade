import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { SiteImage } from '@/models/SiteImage';
import { SITE_IMAGE_SLOTS } from '@/lib/site-images';
import { deleteCloudinaryImage } from '@/lib/upload';
import { isOwnCloudinaryUrl } from '@/lib/cloudinary-sign';
import { logAdminAction } from '@/services/audit.service';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const rows = await SiteImage.find().lean();
  const map = Object.fromEntries(rows.map((r) => [r.key, r]));
  const catalog = SITE_IMAGE_SLOTS.map((s) => ({ ...s, custom: false, current: map[s.key]?.url ?? null, alt: map[s.key]?.alt ?? '' }));
  const known = new Set(SITE_IMAGE_SLOTS.map((s) => s.key));
  const custom = rows.filter((r) => !known.has(r.key)).map((r) => ({
    key: r.key, label: r.label || r.key, group: r.group || 'Emplacements personnalisés', fallback: '', custom: true, current: r.url, alt: r.alt ?? '',
  }));
  return NextResponse.json({ success: true, data: [...catalog, ...custom] });
}

/** Définit l'image d'un emplacement (image déjà envoyée sur Cloudinary). `custom` crée un nouvel emplacement. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const b = await req.json().catch(() => null);
  if (!b || !isOwnCloudinaryUrl(b.url)) return NextResponse.json({ success: false, error: 'Image invalide' }, { status: 400 });
  const key = String(b.key || '').trim();
  const inCatalog = SITE_IMAGE_SLOTS.some((s) => s.key === key);
  const existing = await SiteImage.findOne({ key });
  if (!inCatalog && !existing && !b.custom) return NextResponse.json({ success: false, error: 'Emplacement inconnu' }, { status: 400 });
  if (!inCatalog && !/^[a-z0-9][a-z0-9._-]{2,60}$/.test(key)) {
    return NextResponse.json({ success: false, error: 'Clé invalide (lettres minuscules, chiffres, . _ -)' }, { status: 400 });
  }
  const publicId = b.publicId ? String(b.publicId) : undefined;
  if (existing?.publicId && existing.publicId !== publicId) await deleteCloudinaryImage(existing.publicId);
  const update: Record<string, unknown> = { key, url: b.url, alt: String(b.alt || '').slice(0, 200), publicId };
  if (!inCatalog) Object.assign(update, { custom: true, label: String(b.label || key).slice(0, 120), group: String(b.group || 'Emplacements personnalisés').slice(0, 60) });
  const saved = await SiteImage.findOneAndUpdate({ key }, update, { upsert: true, new: true });
  await logAdminAction({ adminId: auth.user.userId, action: 'site-image.set', modelType: 'SiteImage', modelId: key });
  return NextResponse.json({ success: true, data: saved });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const key = req.nextUrl.searchParams.get('key') || '';
  const row = await SiteImage.findOneAndDelete({ key });
  if (row) {
    await deleteCloudinaryImage(row.publicId);
    await logAdminAction({ adminId: auth.user.userId, action: 'site-image.reset', modelType: 'SiteImage', modelId: key });
  }
  return NextResponse.json({ success: true });
}
