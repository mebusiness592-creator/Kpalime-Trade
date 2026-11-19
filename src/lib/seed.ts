import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Currency } from '@/models/Currency';

export async function seedEssentialData() {
  await connectDB();

  // Devises
  const currencyCount = await Currency.countDocuments();
  if (currencyCount === 0) {
    await Currency.insertMany([
      { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rateToXOF: 1, isDefault: true, isActive: true },
      { code: 'USD', name: 'Dollar américain', symbol: '$', rateToXOF: Number(process.env.DEFAULT_USD_RATE) || 600, isDefault: false, isActive: true },
      { code: 'EUR', name: 'Euro', symbol: '€', rateToXOF: Number(process.env.DEFAULT_EUR_RATE) || 655.957, isDefault: false, isActive: true },
    ]);
  }

  // Catégories du Marketplace (14 catégories + celles déjà créées par l'admin sont conservées)
  const { MARKETPLACE_CATEGORIES } = await import('@/lib/marketplace-categories');
  for (const [i, c] of MARKETPLACE_CATEGORIES.entries()) {
    await Category.updateOne({ slug: c.slug }, { $setOnInsert: { name: c.name, slug: c.slug, description: c.description, position: i + 1, isActive: true } }, { upsert: true });
  }

  return { seeded: true };
}
