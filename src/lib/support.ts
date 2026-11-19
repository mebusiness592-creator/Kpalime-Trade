import mongoose from 'mongoose';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';

export { SUBJECT_LABELS, STATUS_LABELS } from '@/lib/support-labels';

export function newReference() {
  return `KT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export async function notifyUser(userId: string | mongoose.Types.ObjectId, title: string, body: string, link?: string) {
  await Notification.create({ userId, title, body, type: 'support', link });
}

export async function notifyAdmins(title: string, body: string, link?: string) {
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
  if (admins.length) await Notification.insertMany(admins.map((a) => ({ userId: a._id, title, body, type: 'support', link })));
}
