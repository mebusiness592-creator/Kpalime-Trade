import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { MediaAsset } from '@/models/MediaAsset';
import { deleteCloudinaryImage } from '@/lib/upload';
import { isOwnCloudinaryUrl } from '@/lib/cloudinary-sign';
import { logAdminAction } from '@/services/audit.service';
import { isValidObjectId } from '@/lib/security';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const folder = req.nextUrl.searchParams.get('folder');
  const items = await MediaAsset.find(folder ? { folder } : {}).sort({ createdAt: -1 }).limit(300).lean();
  return NextResponse.json({ success: true, data: items });
}

/** Enregistre dans la médiathèque une image déjà envoyée sur Cloudinary. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const b = await req.json().catch(() => null);
  if (!b || !isOwnCloudinaryUrl(b.url) || !b.publicId) return NextResponse.json({ success: false, error: 'Image invalide' }, { status: 400 });
  const asset = await MediaAsset.create({
    url: b.url, publicId: String(b.publicId), folder: String(b.folder || 'general').slice(0, 40),
    label: b.label ? String(b.label).slice(0, 120) : undefined, uploadedBy: auth.user.userId,
  });
  await logAdminAction({ adminId: auth.user.userId, action: 'media.add', modelType: 'MediaAsset', modelId: String(asset._id) });
  return NextResponse.json({ success: true, data: asset }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
  const asset = await MediaAsset.findByIdAndDelete(id);
  if (asset) {
    await deleteCloudinaryImage(asset.publicId);
    await logAdminAction({ adminId: auth.user.userId, action: 'media.delete', modelType: 'MediaAsset', modelId: id });
  }
  return NextResponse.json({ success: true });
}
