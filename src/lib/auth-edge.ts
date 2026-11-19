import { jwtVerify } from 'jose';

/** Vérification JWT compatible runtime Edge (utilisée par le middleware). */
export async function verifyTokenEdge(token: string): Promise<{ userId: string; role: string; email: string; name?: string } | null> {
  const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev_only_secret_change_me');
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as never;
  } catch {
    return null;
  }
}
