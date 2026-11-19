import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { Inquiry } from '@/models/Inquiry';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const items = await Inquiry.find().select('-replies').populate('recipientId', 'name email').sort({ createdAt: -1 }).limit(300).lean();
  return NextResponse.json({ success: true, data: items });
}
