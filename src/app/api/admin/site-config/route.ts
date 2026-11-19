import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/guards';
import { SiteConfig } from '@/models/SiteConfig';
import { DEFAULT_SETTINGS, HEX, type SiteSettings } from '@/lib/site-config';
import { isOwnCloudinaryUrl } from '@/lib/cloudinary-sign';
import { logAdminAction } from '@/services/audit.service';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const doc = await SiteConfig.findOne({ key: 'main' }).lean();
  return NextResponse.json({ success: true, data: { ...DEFAULT_SETTINGS, ...((doc?.data as object) ?? {}) } });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const b = await req.json().catch(() => null) as Partial<SiteSettings> | null;
  if (!b) return NextResponse.json({ success: false, error: 'Requête invalide' }, { status: 400 });
  const data: Record<string, string> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const raw = b[k];
    if (typeof raw !== 'string') continue;
    const val = raw.trim().slice(0, 500);
    if (k.startsWith('color')) { if (!HEX.test(val)) return NextResponse.json({ success: false, error: `Couleur invalide (${k})` }, { status: 400 }); }
    if (k === 'logoUrl' && val && !isOwnCloudinaryUrl(val)) return NextResponse.json({ success: false, error: 'Logo invalide' }, { status: 400 });
    if (['facebook', 'instagram', 'twitter', 'youtube'].includes(k) && val && !/^https?:\/\//.test(val)) return NextResponse.json({ success: false, error: `Lien ${k} invalide (commencer par https://)` }, { status: 400 });
    data[k] = val;
  }
  await SiteConfig.findOneAndUpdate({ key: 'main' }, { $set: { data } }, { upsert: true });
  revalidateTag('site-config');
  await logAdminAction({ adminId: auth.user.userId, action: 'site-config.update', modelType: 'SiteConfig', modelId: 'main' });
  return NextResponse.json({ success: true });
}
