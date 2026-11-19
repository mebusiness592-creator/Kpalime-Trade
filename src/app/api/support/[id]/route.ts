import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/guards';
import { SupportTicket } from '@/models/SupportTicket';
import { isValidObjectId } from '@/lib/security';
import { notifyAdmins } from '@/lib/support';

type Ctx = { params: Promise<{ id: string }> };

/** Un utilisateur ne peut lire que SES tickets. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
  const ticket = await SupportTicket.findOne({ _id: id, userId: auth.user.userId }).lean();
  if (!ticket) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ success: true, data: ticket });
}

const replySchema = z.object({ message: z.string().min(1).max(5000), attachments: z.array(z.string().url()).max(5).optional() });

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Message invalide' }, { status: 400 });
  const ticket = await SupportTicket.findOne({ _id: id, userId: auth.user.userId });
  if (!ticket) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  if (ticket.status === 'closed') return NextResponse.json({ success: false, error: 'Dossier fermé' }, { status: 409 });
  ticket.messages.push({ authorId: auth.user.userId as never, authorRole: 'user', body: parsed.data.message, attachments: parsed.data.attachments ?? [] } as never);
  ticket.status = 'awaiting_admin';
  await ticket.save();
  await notifyAdmins('Nouvelle réponse d’un utilisateur', `${ticket.reference} : ${ticket.title}`, `/admin/support/${ticket._id}`);
  return NextResponse.json({ success: true, data: ticket });
}
