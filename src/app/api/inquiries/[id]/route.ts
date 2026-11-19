import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/guards';
import { Inquiry, INQUIRY_STATUSES } from '@/models/Inquiry';
import { isValidObjectId } from '@/lib/security';
import { notifyUser } from '@/lib/support';

type Ctx = { params: Promise<{ id: string }> };

async function load(ctx: Ctx) {
  const { id } = await ctx.params;
  const auth = await requireUser();
  if ('error' in auth) return { res: auth.error };
  if (!isValidObjectId(id)) return { res: NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 }) };
  const inq = await Inquiry.findById(id);
  // Seuls le destinataire et l'expéditeur (ou un admin) accèdent à la demande
  const uid = auth.user.userId;
  const isRecipient = String(inq?.recipientId) === uid;
  const isSender = !!inq?.senderId && String(inq.senderId) === uid;
  if (!inq || (!isRecipient && !isSender && auth.user.role !== 'admin')) return { res: NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 }) };
  return { inq, auth, isRecipient };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const r = await load(ctx);
  if ('res' in r) return r.res;
  if (r.isRecipient && r.inq.status === 'new') { r.inq.status = 'read'; await r.inq.save(); }
  return NextResponse.json({ success: true, data: r.inq, isRecipient: r.isRecipient });
}

const schema = z.object({ message: z.string().min(1).max(4000).optional(), status: z.enum(INQUIRY_STATUSES).optional() });

export async function POST(req: NextRequest, ctx: Ctx) {
  const r = await load(ctx);
  if ('res' in r) return r.res;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 });
  const { inq, auth, isRecipient } = r;
  if (parsed.data.message) {
    inq.replies.push({ authorId: auth.user.userId as never, fromRecipient: isRecipient, body: parsed.data.message, createdAt: new Date() });
    if (isRecipient) inq.status = 'replied';
    else if (inq.status === 'closed' || inq.status === 'replied') inq.status = 'read';
    const other = isRecipient ? inq.senderId : inq.recipientId;
    if (other) await notifyUser(other, isRecipient ? 'Réponse à votre demande' : 'Nouveau message sur une demande', `${inq.reference} : ${inq.targetName}`, `/dashboard/inquiries/${inq._id}`);
  }
  if (parsed.data.status && isRecipient) inq.status = parsed.data.status;
  await inq.save();
  return NextResponse.json({ success: true, data: inq });
}
