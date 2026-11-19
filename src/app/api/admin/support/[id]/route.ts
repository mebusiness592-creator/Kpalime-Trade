import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/guards';
import { SupportTicket, TICKET_STATUSES } from '@/models/SupportTicket';
import { isValidObjectId } from '@/lib/security';
import { notifyUser, STATUS_LABELS } from '@/lib/support';
import { logAdminAction } from '@/services/audit.service';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
  const t = await SupportTicket.findById(id).populate('userId', 'name email phone role').lean();
  if (!t) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ success: true, data: t });
}

const schema = z.object({
  message: z.string().max(5000).optional(),
  attachments: z.array(z.string().url()).max(5).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  assignedTo: z.string().optional(),
});

/** Répondre et/ou changer le statut / l'assignation. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 });
  const t = await SupportTicket.findById(id);
  if (!t) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });

  const { message, attachments, status, assignedTo } = parsed.data;
  if (message?.trim()) {
    t.messages.push({ authorId: auth.user.userId as never, authorRole: 'admin', body: message.trim(), attachments: attachments ?? [] } as never);
    t.status = status ?? 'awaiting_user';
  } else if (status) {
    t.status = status;
  }
  if (assignedTo && isValidObjectId(assignedTo)) t.assignedTo = assignedTo as never;
  await t.save();

  if (message?.trim()) await notifyUser(t.userId, 'L’administration a répondu à votre demande', `${t.reference} : ${t.title}`, `/dashboard/support/${t._id}`);
  else if (status) await notifyUser(t.userId, 'Statut de votre demande mis à jour', `${t.reference} : ${STATUS_LABELS[status]}`, `/dashboard/support/${t._id}`);
  await logAdminAction({ adminId: auth.user.userId, action: 'support.update', modelType: 'SupportTicket', modelId: id, changes: { status, replied: !!message?.trim() } });
  return NextResponse.json({ success: true, data: t });
}
