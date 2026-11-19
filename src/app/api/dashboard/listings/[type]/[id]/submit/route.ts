import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/guards';
import { LISTING_CONFIG } from '@/lib/listing-config';
import { LISTING_MODELS, isListingType } from '@/lib/listings';
import { isValidObjectId } from '@/lib/security';
import { notifyAdmins } from '@/lib/support';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!isListingType(type) || !isValidObjectId(id)) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  const auth = await requireUser([LISTING_CONFIG[type].role]);
  if ('error' in auth) return auth.error;
  const doc = await LISTING_MODELS[type].findOne({ _id: id, ownerId: auth.user.userId });
  if (!doc) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 });
  if (!['draft', 'needs_correction', 'rejected'].includes(doc.status)) {
    return NextResponse.json({ success: false, error: 'Cette fiche ne peut pas être soumise dans son état actuel' }, { status: 409 });
  }
  doc.status = 'pending'; doc.isActive = false; doc.submittedAt = new Date(); doc.adminNote = undefined;
  await doc.save();
  await notifyAdmins('Publication à valider', `${doc.name} (${type})`, `/admin/publications?type=${type}&focus=${doc._id}`);
  return NextResponse.json({ success: true, data: doc });
}
