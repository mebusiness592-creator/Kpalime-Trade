
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOGO_REGIONS } from '@/lib/togo-regions';
import { getSiteImageMap } from '@/lib/site-images';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

const SECTION_LINKS: Record<string, [string, string]> = {
  sites: ['/tourism', 'Sites touristiques'],
  hotels: ['/hotels', 'Hôtels & hébergements'],
  restaurants: ['/restaurants', 'Restaurants'],
  culture: ['/culture', 'Culture & traditions'],
  activites: ['/tourism', 'Activités & expériences'],
  evenements: ['/events', 'Événements'],
  randonnees: ['/tourism', 'Randonnées'],
  cascades: ['/tourism', 'Cascades'],
  artisanat: ['/culture/artisans', 'Artisans'],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = TOGO_REGIONS.find((x) => x.slug === slug);

  return {
    title: r?.name ?? 'Région',
    description: r?.description,
  };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = TOGO_REGIONS.find((r) => r.slug === slug);

  if (!region) notFound();

  const imgs = await getSiteImageMap();
  const banner = imgs[`region.${region.id}.banner`]?.url;

  const gallery = [1, 2, 3, 4, 5]
    .map((n) => imgs[`region.${region.id}.g${n}`]?.url)
    .filter(Boolean) as string[];

  return (
    <div>
      <section className="relative isolate overflow-hidden min-h-[380px] flex items-end">
        {banner ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={banner}
            alt={region.name}
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-night-light to-emerald-brand/30" />
        )}

        <div className="w-full bg-gradient-to-t from-night via-black/40 to-black/20">
          <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
            <Link href="/discover" className="text-sm text-gold hover:underline">
              ← Découvrir le Togo
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold text-white mt-2">
              {region.name}
            </h1>

            <p className="text-white/80 mt-2">
              Chef-lieu : {region.chefLieu}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <p className="text-lg text-muted max-w-3xl leading-relaxed">
          {region.description}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {region.subCategories.map((s) => {
            const link = SECTION_LINKS[s.id] ?? ['/discover', s.name];
            const img = imgs[`region.${region.id}.section.${s.id}`]?.url;

            return (
              <Link
                key={s.id}
                href={link[0]}
                className="group rounded-xl overflow-hidden border border-white/10 bg-night-light hover:border-emerald-brand/50 transition-colors"
              >
                {img && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img}
                    alt={s.name}
                    className="h-36 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3 className="font-semibold text-white group-hover:text-gold">
                    {s.name}
                  </h3>

                  <p className="text-sm text-muted mt-1">
                    {s.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {gallery.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Galerie
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((g) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={g}
                  src={g}
                  alt={region.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-night-light p-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white">
            Vous avez un hôtel, un restaurant ou une entreprise dans cette région ?
          </p>

          <Link
            href="/auth/register"
            className="px-5 py-2.5 rounded-md bg-emerald-brand text-white font-semibold hover:bg-emerald-light"
          >
            Inscrire mon activité
          </Link>
        </div>
      </div>
    </div>
  );
}
