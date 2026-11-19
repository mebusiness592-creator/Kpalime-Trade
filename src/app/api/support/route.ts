import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/guards';
import { SupportTicket, TICKET_SUBJECTS } from '@/models/SupportTicket';
import { newReference, notifyAdmins } from '@/lib/support';

const createSchema = z.object({
  subject: z.enum(TICKET_SUBJECTS),
  title: z.string().min(3, 'Titre trop court').max(200),
  message: z.string().min(5, 'Message trop court').max(5000),
  attachments: z.array(z.string().url()).max(5).optional(),
  relatedModel: z.string().max(40).optional(),
  relatedId: z.string().max(40).optional(),
});

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const items = await SupportTicket.find({ userId: auth.user.userId }).select('-messages').sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  const { message, attachments, ...rest } = parsed.data;
  const ticket = await SupportTicket.create({
    ...rest, reference: newReference(), userId: auth.user.userId, status: 'new',
    messages: [{ authorId: auth.user.userId, authorRole: 'user', body: message, attachments: attachments ?? [] }],
  });
  await notifyAdmins('Nouvelle demande d’assistance', `${auth.user.name ?? auth.user.email} : ${ticket.title}`, `/admin/support/${ticket._id}`);
  return NextResponse.json({ success: true, data: ticket }, { status: 201 });
}
