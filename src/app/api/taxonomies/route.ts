import { NextRequest, NextResponse } from 'next/server';
import { getTaxonomy } from '@/lib/taxonomy';

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get('kind') || '';
  if (!/^[a-z]{3,20}$/.test(kind)) return NextResponse.json({ success: false, error: 'Type invalide' }, { status: 400 });
  return NextResponse.json({ success: true, data: await getTaxonomy(kind) });
}
