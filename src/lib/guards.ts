import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

type Payload = { userId: string; role: string; email: string; name?: string };

/** Vérifie côté serveur (API) que l'utilisateur est connecté, actif et possède un des rôles. */
export async function requireUser(roles?: string[]): Promise<{ user: Payload } | { error: NextResponse }> {
  const payload = (await getCurrentUser()) as Payload | null;
  if (!payload?.userId) {
    return { error: NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 }) };
  }
  await connectDB();
  const dbUser = await User.findById(payload.userId).select('role isActive').lean();
  if (!dbUser || !dbUser.isActive) {
    return { error: NextResponse.json({ success: false, error: 'Compte désactivé' }, { status: 403 }) };
  }
  if (roles && !roles.includes(dbUser.role)) {
    return { error: NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }) };
  }
  return { user: { ...payload, role: dbUser.role } };
}

export const requireAdmin = () => requireUser(['admin']);
