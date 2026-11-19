import { requireUser } from '@/lib/guards';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getOwnerAccommodations } from '@/services/accommodation.service';
import { AccommodationStatus } from '@/types/accommodation';

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI non défini');
  await mongoose.connect(MONGODB_URI);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireUser(['accommodation_owner', 'admin']);
    if ('error' in auth) return auth.error;
    const user = { id: auth.user.userId };

    // Récupérer le filtre de statut depuis les params URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AccommodationStatus || undefined;

    // Récupérer les établissements du propriétaire
    const result = await getOwnerAccommodations(user.id, status);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/accommodations/owner:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}