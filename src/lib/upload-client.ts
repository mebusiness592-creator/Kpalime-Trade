export interface UploadedImage { url: string; publicId: string; width?: number; height?: number }

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/**
 * Envoie une image directement vers Cloudinary (signature fournie par le serveur).
 * `sub` : sous-dossier (réservé aux admins : site, hero, theme, media...).
 */
export async function uploadImage(file: File, sub?: string): Promise<UploadedImage> {
  if (!TYPES.includes(file.type)) throw new Error('Format non autorisé (JPG, PNG, WebP, GIF ou AVIF)');
  if (file.size > MAX_BYTES) throw new Error('Image trop lourde (10 Mo maximum)');

  const sign = await fetch('/api/upload/sign', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub }),
  }).then((r) => r.json());
  if (!sign.success) throw new Error(sign.error || 'Envoi non autorisé');
  const s = sign.data;

  const fd = new FormData();
  fd.set('file', file);
  fd.set('api_key', s.apiKey);
  fd.set('timestamp', String(s.timestamp));
  fd.set('folder', s.folder);
  fd.set('signature', s.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || 'Échec de l’envoi vers Cloudinary');
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}
