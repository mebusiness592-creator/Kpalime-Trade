import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { getResource, RESOURCE_POPULATE, escapeRegex } from '@/lib/admin-resources.server';
import { sanitizeFields, slugify, autoCategory } from '@/lib/listings';
import { logAdminAction } from '@/services/audit.service';

type Ctx = { params: Promise<{ resource: string }> };
const PAGE = 20;

export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const r = getResource((await params).resource);
  if (!r) return NextResponse.json({ success: false, error: 'Menu inconnu' }, { status: 404 });
  const { cfg, model } = r;
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') || '').trim().slice(0, 80);
  const status = sp.get('status') || 'all';
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = cfg.searchFields.map((f) => ({ [f]: { $regex: escapeRegex(q), $options: 'i' } }));
  if (cfg.statusField && status !== 'all') filter[cfg.statusField] = status;

  let query = model.find(filter).select('-password').sort(cfg.key === 'categories' ? { position: 1 } : { createdAt: -1 }).skip((page - 1) * PAGE).limit(PAGE);
  for (const p of RESOURCE_POPULATE[cfg.key] ?? []) query = query.populate(p);
  const [data, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
  return NextResponse.json({ success: true, data, total, page, pages: Math.max(1, Math.ceil(total / PAGE)) });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const key = (await params).resource;
  const r = getResource(key);
  if (!r || !r.cfg.canCreate || !r.cfg.fields) return NextResponse.json({ success: false, error: 'Création non disponible' }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'Requête invalide' }, { status: 400 });
  const { data, error } = sanitizeFields(r.cfg.fields, body);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });

  if (key === 'services' || key === 'tourism') await autoCategory(key === 'services' ? 'service' : 'tourism', data);
  const extra: Record<string, unknown> = {};
  if (r.cfg.slugFrom) extra.slug = slugify(String(data[r.cfg.slugFrom]), !['categories', 'taxonomies'].includes(key));
  if (['restaurants', 'services', 'tourism'].includes(key)) Object.assign(extra, { status: 'approved', isActive: true });
  if (key === 'events') extra.status = 'published';
  if (key === 'culture') extra.publishedAt = new Date();
  if (key === 'categories' && data.isActive === undefined) data.isActive = true;
  if (key === 'banners') { data.isActive = data.isActive ?? true; data.overlay = data.overlay ?? 55; data.align = data.align || 'left'; data.order = data.order ?? 0; }
  try {
    const doc = await r.model.create({ ...data, ...extra });
    if (key === 'banners') revalidateTag('site-config');
    if (key === 'taxonomies' || key === 'categories') revalidateTag('taxonomy');
    await logAdminAction({ adminId: auth.user.userId, action: `${key}.create`, modelType: key, modelId: String(doc._id) });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (e) {
    const dup = (e as { code?: number }).code === 11000;
    return NextResponse.json({ success: false, error: dup ? 'Cet élément existe déjà (identifiant en double)' : 'Enregistrement impossible' }, { status: dup ? 409 : 500 });
  }
}
