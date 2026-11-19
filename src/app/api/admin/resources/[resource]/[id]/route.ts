import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { getResource, recipientOf } from '@/lib/admin-resources.server';
import { sanitizeFields } from '@/lib/listings';
import { isValidObjectId } from '@/lib/security';
import { logAdminAction } from '@/services/audit.service';
import { Notification } from '@/models/Notification';

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function prep(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const auth = await requireAdmin();
  if ('error' in auth) return { res: auth.error };
  const r = getResource(resource);
  if (!r || !isValidObjectId(id)) return { res: NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 }) };
  return { auth, r, resource, id };
}

/** Modification des champs d'une fiche (formulaire d'édition). */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const p = await prep(ctx);
  if ('res' in p) return p.res;
  const { r, resource, id, auth } = p;
  if (!r.cfg.fields) return NextResponse.json({ success: false, error: 'Modification non disponible' }, { status: 400 });
  const body = await req.json().catch(() => null);
  const { data, error } = sanitizeFields(r.cfg.fields, body ?? {}, true);
  if (error || !data) return NextResponse.json({ success: false, error }, { status: 400 });
  const doc = await r.model.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!doc) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  if (resource === 'banners') revalidateTag('site-config');
  await logAdminAction({ adminId: auth.user.userId, action: `${resource}.update`, modelType: resource, modelId: id });
  return NextResponse.json({ success: true, data: doc });
}

/** Action de gestion : approuver, refuser, suspendre, changer de statut ou de rôle... */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const p = await prep(ctx);
  if ('res' in p) return p.res;
  const { r, resource, id, auth } = p;
  const body = await req.json().catch(() => null) as { action?: string; note?: string; value?: string } | null;
  const action = r.cfg.actions.find((a) => a.key === body?.action);
  if (!action) return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  const note = body?.note?.trim();
  if (action.needsNote && !note) return NextResponse.json({ success: false, error: 'Un message explicatif est obligatoire' }, { status: 400 });

  const doc = await r.model.findById(id);
  if (!doc) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  if (resource === 'users' && id === auth.user.userId && ['suspend', 'role'].includes(action.key)) {
    return NextResponse.json({ success: false, error: 'Vous ne pouvez pas modifier votre propre compte administrateur' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(action.set ?? {})) update[k] = v === '$now' ? new Date() : v;
  if (action.optionField) {
    if (!action.options?.some((o) => o.value === body?.value)) return NextResponse.json({ success: false, error: 'Valeur invalide' }, { status: 400 });
    update[action.optionField] = body?.value;
  }
  if (action.noteField && note) update[action.noteField] = note;
  if (action.set && 'status' in action.set && action.key === 'approve') {
    for (const f of ['adminNote', 'rejectionReason', 'correctionRequest']) if (f in doc.schema.paths) update[f] = undefined;
  }
  doc.set(update);
  await doc.save();

  if (action.notify) {
    const to = await recipientOf(resource, doc);
    if (to) {
      const name = (doc as { name?: string; title?: string; reference?: string }).name || (doc as { title?: string }).title || (doc as { reference?: string }).reference || r.cfg.singular;
      const text = resource === 'users' || resource === 'orders' ? action.notify : `« ${name} » ${action.notify} ${note ?? ''}`.trim();
      await Notification.create({ userId: to, title: `Votre ${r.cfg.singular} : mise à jour`, body: text, type: 'system' });
    }
  }
  if (resource === 'banners') revalidateTag('site-config');
  await logAdminAction({ adminId: auth.user.userId, action: `${resource}.${action.key}`, modelType: resource, modelId: id, changes: { note, value: body?.value } });
  return NextResponse.json({ success: true, data: doc });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const p = await prep(ctx);
  if ('res' in p) return p.res;
  const { r, resource, id, auth } = p;
  if (!r.cfg.canDelete) return NextResponse.json({ success: false, error: 'Suppression non autorisée' }, { status: 400 });
  await r.model.findByIdAndDelete(id);
  if (resource === 'banners') revalidateTag('site-config');
  await logAdminAction({ adminId: auth.user.userId, action: `${resource}.delete`, modelType: resource, modelId: id });
  return NextResponse.json({ success: true });
}
