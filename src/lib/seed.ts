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

  // Catégories de départ (stockées en base : modifiables, supprimables et extensibles depuis l'admin)
  const productCats: [string, string][] = [['Agriculture & agroalimentaire', 'agriculture-agroalimentaire'], ['Légumes & fruits', 'legumes-fruits'], ['Café & cacao', 'cafe-cacao'], ['Épices & produits naturels', 'epices-produits-naturels'], ['Huiles végétales', 'huiles-vegetales'], ['Artisanat & art', 'artisanat-art'], ['Textile & habillement', 'textile-habillement'], ['Beauté & cosmétique', 'beaute-cosmetique'], ['Maison & décoration', 'maison-decoration'], ['Matériaux & équipements', 'materiaux-equipements'], ['Technologie', 'technologie'], ['Autres produits', 'autres-produits']];
  for (const [i, [name, slug]] of productCats.entries()) {
    await Category.updateOne({ slug }, { $setOnInsert: { name, slug, position: i + 1, isActive: true } }, { upsert: true });
  }
  const { Taxonomy } = await import('@/models/Taxonomy');
  const tax: [string, string, string[]][] = [
    ['service', 'Construction & bâtiment', ['maçon', 'construction', 'bâtiment', 'chantier', 'peinture']], ['service', 'Électricité', ['électricien', 'électricité', 'câblage']],
    ['service', 'Plomberie', ['plombier', 'plomberie', 'sanitaire', 'robinet']], ['service', 'Transport & logistique', ['transport', 'livraison', 'camion', 'logistique']],
    ['service', 'Informatique & numérique', ['informatique', 'site web', 'application', 'développeur', 'réseau']], ['service', 'Artisanat & ateliers', ['artisan', 'atelier', 'couture', 'menuiserie']],
    ['service', 'Services professionnels', ['conseil', 'comptable', 'juridique', 'formation']],
    ['tourism', 'Cascade', ['cascade', 'chute']], ['tourism', 'Montagne & randonnée', ['montagne', 'mont', 'randonnée', 'sommet']], ['tourism', 'Forêt & nature', ['forêt', 'nature', 'réserve', 'parc']],
    ['tourism', 'Village & culture', ['village', 'culture', 'tradition', 'patrimoine']], ['tourism', 'Marché', ['marché']],
    ['restaurant', 'Cuisine togolaise', ['togolais', 'fufu', 'akoumé', 'pâte']], ['restaurant', 'Cuisine internationale', ['pizza', 'burger', 'international']], ['restaurant', 'Fruits de mer', ['poisson', 'crevette', 'fruits de mer']], ['restaurant', 'Pâtisserie & café', ['pâtisserie', 'café', 'gâteau']],
    ['event', 'Festival', []], ['event', 'Concert', []], ['event', 'Exposition', []], ['event', 'Conférence', []], ['event', 'Sport', []], ['event', 'Marché & foire', []],
    ['culture', 'Histoire', []], ['culture', 'Traditions', []], ['culture', 'Patrimoine', []], ['culture', 'Gastronomie', []],
  ];
  const slugOf = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  for (const [i, [kind, name, keywords]] of tax.entries()) {
    await Taxonomy.updateOne({ kind, slug: slugOf(name) }, { $setOnInsert: { kind, name, slug: slugOf(name), keywords, position: i, isActive: true } }, { upsert: true });
  }

  return { seeded: true };
}
