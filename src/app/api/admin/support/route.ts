import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { SupportTicket } from '@/models/SupportTicket';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const status = req.nextUrl.searchParams.get('status');
  const filter = status && status !== 'all' ? { status } : {};
  const items = await SupportTicket.find(filter).select('-messages').populate('userId', 'name email role').sort({ updatedAt: -1 }).limit(200).lean();
  return NextResponse.json({ success: true, data: items });
}
