import { NextResponse } from 'next/server';
import { getSiteImageMap } from '@/lib/site-images';

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({ success: true, data: await getSiteImageMap() });
}
