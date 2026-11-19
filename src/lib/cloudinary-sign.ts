import { cloudinary } from '@/lib/cloudinary';

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/** Signature pour un envoi direct navigateur → Cloudinary (les fichiers ne transitent pas par le serveur). */
export function signUpload(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET || '');
  return { cloudName: CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY || '', timestamp, folder, signature };
}

/** Une URL d'image n'est acceptée que si elle provient de NOTRE espace Cloudinary. */
export function isOwnCloudinaryUrl(url: unknown): url is string {
  return typeof url === 'string' && !!CLOUD_NAME && url.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/`);
}
