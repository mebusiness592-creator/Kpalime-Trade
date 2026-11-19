import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/guards';
import { User } from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2).max(100).optional(), phone: z.string().min(6).max(30).optional(),
  currentPassword: z.string().optional(), newPassword: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(100).optional(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  const user = await User.findById(auth.user.userId).select('+password');
  if (!user) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  const { name, phone, currentPassword, newPassword } = parsed.data;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (newPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.password))) return NextResponse.json({ success: false, error: 'Mot de passe actuel incorrect' }, { status: 400 });
    user.password = await hashPassword(newPassword);
  }
  await user.save();
  return NextResponse.json({ success: true });
}
