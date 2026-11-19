import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/guards';
import { checkRateLimit } from '@/lib/security';
import { signUpload, CLOUD_NAME } from '@/lib/cloudinary-sign';

/** Délivre une signature d'envoi Cloudinary. Dossier imposé par le serveur selon le rôle. */
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  if (!CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ success: false, error: 'Cloudinary n’est pas configuré (variables d’environnement manquantes)' }, { status: 503 });
  }
  if (!checkRateLimit(`sign:${auth.user.userId}`, 60, 60_000)) {
    return NextResponse.json({ success: false, error: 'Trop de requêtes, réessayez dans une minute' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  let folder: string;
  if (auth.user.role === 'admin') {
    const sub = String(body?.sub || 'site').replace(/[^a-z0-9-_]/gi, '').slice(0, 40) || 'site';
    folder = `kpalime-trade/${sub}`;
  } else {
    folder = `kpalime-trade/users/${auth.user.userId}`;
  }
  return NextResponse.json({ success: true, data: signUpload(folder) });
}
