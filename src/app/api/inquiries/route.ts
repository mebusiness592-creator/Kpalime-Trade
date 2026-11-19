import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, isValidObjectId } from '@/lib/security';
import { Inquiry, INQUIRY_KINDS, TARGET_TYPES } from '@/models/Inquiry';
import { resolveTarget } from '@/lib/inquiry-target';
import { newReference, notifyUser } from '@/lib/support';
import { requireUser } from '@/lib/guards';

const schema = z.object({
  kind: z.enum(INQUIRY_KINDS),
  targetType: z.enum(TARGET_TYPES),
  targetId: z.string().refine(isValidObjectId, 'Fiche invalide'),
  name: z.string().min(2, 'Nom requis').max(120),
  email: z.string().email('E-mail invalide'),
  phone: z.string().max(40).optional(),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)').max(4000),
  details: z.object({ quantity: z.string().max(80).optional(), checkIn: z.string().max(20).optional(), checkOut: z.string().max(20).optional(), guests: z.number().int().min(1).max(100).optional(), budget: z.string().max(80).optional() }).optional(),
});

/** Visiteurs et acheteurs : envoyer une demande de renseignements / devis / réservation. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anon';
  if (!checkRateLimit(`inq:${ip}`, 8, 10 * 60_000)) return NextResponse.json({ success: false, error: 'Trop de demandes, réessayez plus tard' }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  await connectDB();
  const target = await resolveTarget(parsed.data.targetType, parsed.data.targetId);
  if (!target) return NextResponse.json({ success: false, error: 'Cette fiche n’accepte pas encore de demandes' }, { status: 404 });
  const session = (await getCurrentUser()) as { userId?: string } | null;
  const inq = await Inquiry.create({
    ...parsed.data, reference: newReference(), targetName: target.name, targetSlug: target.slug,
    recipientId: target.recipientId, senderId: session?.userId, status: 'new',
  });
  await notifyUser(target.recipientId, 'Nouvelle demande reçue', `${parsed.data.name} : ${target.name}`, `/dashboard/inquiries/${inq._id}`);
  return NextResponse.json({ success: true, data: { reference: inq.reference } }, { status: 201 });
}

/** ?box=received (professionnel) | sent (acheteur connecté) */
export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const box = req.nextUrl.searchParams.get('box') === 'sent' ? 'sent' : 'received';
  const filter = box === 'sent' ? { senderId: auth.user.userId } : { recipientId: auth.user.userId };
  const items = await Inquiry.find(filter).select('-replies').sort({ updatedAt: -1 }).limit(200).lean();
  return NextResponse.json({ success: true, data: items });
}
