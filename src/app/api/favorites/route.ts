import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/guards';
import { Favorite } from '@/models/Favorite';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const check = req.nextUrl.searchParams.get('targetId');
  if (check) return NextResponse.json({ success: true, data: { saved: !!(await Favorite.exists({ userId: auth.user.userId, targetId: check })) } });
  const items = await Favorite.find({ userId: auth.user.userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: items });
}

const schema = z.object({
  targetType: z.string().max(30), targetId: z.string().max(40), name: z.string().max(200),
  path: z.string().max(300).regex(/^\/[a-zA-Z0-9_\-/]*$/), image: z.string().url().optional(),
});

/** Bascule : ajoute si absent, retire si présent. */
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 });
  const key = { userId: auth.user.userId, targetType: parsed.data.targetType, targetId: parsed.data.targetId };
  const existing = await Favorite.findOneAndDelete(key);
  if (existing) return NextResponse.json({ success: true, data: { saved: false } });
  await Favorite.create({ ...key, name: parsed.data.name, path: parsed.data.path, image: parsed.data.image });
  return NextResponse.json({ success: true, data: { saved: true } });
}
