import { cloudinary } from '@/lib/cloudinary';

export async function deleteCloudinaryImage(publicId?: string) {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId); } catch { /* best effort */ }
}
