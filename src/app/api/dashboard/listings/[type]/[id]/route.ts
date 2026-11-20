import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/guards';
import { LISTING_CONFIG } from '@/lib/listing-config';
import { LISTING_MODELS, isListingType, sanitizeListing, autoCategory } from '@/lib/listings';
import { isValidObjectId } from '@/lib/security';
import { notifyAdmins } from '@/lib/support';

type Ctx = { params: Promise<{ type: string; id: string }> };

async function load(ctx: Ctx) {
  const { type, id } = await ctx.params;
  if (!isListingType(type) || !isValidObjectId(id)) return { res: NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 }) };
  const auth = await requireUser([LISTING_CONFIG[type].role]);
  if ('error' in auth) return { res: auth.error };
  // L'utilisateur n'accède qu'à SES fiches
  const doc = await LISTING_MODELS[type].findOne({ _id: id, ownerId: auth.user.userId });
  if (!doc) return { res: NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 }) };
  return { type, doc, auth };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const r = await load(ctx);
  if ('res' in r) return r.res;
  return NextResponse.json({ success: true, data: r.doc });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const r = await load(ctx);
  if ('res' in r) return r.res;
  const { type, doc } = r;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'Requête invalide' }, { status: 400 });
  if (doc.status === 'suspended') return NextResponse.json({ success: false, error: 'Fiche suspendue : contactez l’assistance' }, { status: 403 });
  const { data, error } = sanitizeListing(type, body, true);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });

  await autoCategory(type, data, doc.get('category') && doc.get('category') !== 'autre' ? doc.get('category') : undefined);
  const cfg = LISTING_CONFIG[type];
  const wasLive = doc.status === 'approved';
  const sensitiveChanged = cfg.sensitive.some((k) => k in data && JSON.stringify(data[k] ?? null) !== JSON.stringify(doc.get(k) ?? null));
  doc.set(data);
  if (wasLive && sensitiveChanged) {
    // Modification sensible d'une fiche publiée : retour en validation
    doc.status = 'pending'; doc.isActive = false; doc.submittedAt = new Date();
    await doc.save();
    await notifyAdmins('Modification à valider', `${doc.name} (${type})`, `/admin/publications?type=${type}&focus=${doc._id}`);
    return NextResponse.json({ success: true, data: doc, message: 'Modification enregistrée : la fiche repasse en validation avant republication.' });
  }
  if (body.submit === true && ['draft', 'needs_correction', 'rejected'].includes(doc.status)) {
    doc.status = 'pending'; doc.isActive = false; doc.submittedAt = new Date(); doc.adminNote = undefined;
    await doc.save();
    await notifyAdmins('Publication à valider', `${doc.name} (${type})`, `/admin/publications?type=${type}&focus=${doc._id}`);
    return NextResponse.json({ success: true, data: doc, message: 'Fiche soumise pour validation.' });
  }
  await doc.save();
  return NextResponse.json({ success: true, data: doc });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const r = await load(ctx);
  if ('res' in r) return r.res;
  await r.doc.deleteOne();
  return NextResponse.json({ success: true });
}
