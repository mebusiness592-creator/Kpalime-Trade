import { NextResponse } from 'next/server';
import { seedEssentialData } from '@/lib/seed';
import { requireAdmin } from '@/lib/guards';

/** Initialise les données essentielles. Réservé aux administrateurs connectés. */
export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const result = await seedEssentialData();
    return NextResponse.json({ success: true, message: 'Données essentielles initialisées', data: result });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur lors du seed' }, { status: 500 });
  }
}
