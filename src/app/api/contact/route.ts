import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/security';
import { ContactMessage } from '@/models/ContactMessage';
import { notifyAdmins } from '@/lib/support';

const schema = z.object({ name: z.string().min(2).max(120), email: z.string().email('E-mail invalide'), phone: z.string().max(40).optional(), subject: z.string().min(3, 'Sujet trop court').max(200), message: z.string().min(10, 'Message trop court').max(4000) });

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anon';
  if (!checkRateLimit(`contact:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ success: false, error: 'Trop de messages, réessayez plus tard' }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  await connectDB();
  await ContactMessage.create(parsed.data);
  await notifyAdmins('Nouveau message de contact', `${parsed.data.name} : ${parsed.data.subject}`, '/admin/contact');
  return NextResponse.json({ success: true }, { status: 201 });
}
