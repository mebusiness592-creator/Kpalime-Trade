import { unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { SiteConfig } from '@/models/SiteConfig';
import { HeroSlide } from '@/models/HeroSlide';

export interface SiteSettings {
  brandName: string; tagline: string; logoUrl: string; footerText: string;
  email: string; phone: string; whatsapp: string; address: string;
  facebook: string; instagram: string; twitter: string; youtube: string;
  colorNight: string; colorNightLight: string; colorAccent: string; colorAccentLight: string; colorGold: string;
  announcement: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'Kpalimé-Trade', tagline: 'Les richesses locales vers le monde entier.', logoUrl: '',
  footerText: 'Plateforme internationale de commerce, de découverte, de services et de développement économique, depuis Kpalimé et le Togo.',
  email: '', phone: '', whatsapp: '', address: 'Kpalimé, Région des Plateaux, Togo',
  facebook: '', instagram: '', twitter: '', youtube: '',
  colorNight: '#071A2B', colorNightLight: '#0D2438', colorAccent: '#00A878', colorAccentLight: '#00C48C', colorGold: '#F5B942',
  announcement: '',
};

export const THEME_PRESETS: { name: string; colors: Pick<SiteSettings, 'colorNight' | 'colorNightLight' | 'colorAccent' | 'colorAccentLight' | 'colorGold'> }[] = [
  { name: 'Nuit & émeraude (par défaut)', colors: { colorNight: '#071A2B', colorNightLight: '#0D2438', colorAccent: '#00A878', colorAccentLight: '#00C48C', colorGold: '#F5B942' } },
  { name: 'Forêt de Kpalimé', colors: { colorNight: '#0B2014', colorNightLight: '#133222', colorAccent: '#3FA34D', colorAccentLight: '#5CC16B', colorGold: '#E9B44C' } },
  { name: 'Terre & latérite', colors: { colorNight: '#24140C', colorNightLight: '#352016', colorAccent: '#D2691E', colorAccentLight: '#E8843A', colorGold: '#F2C14E' } },
  { name: 'Océan', colors: { colorNight: '#06203A', colorNightLight: '#0A2F54', colorAccent: '#1E88E5', colorAccentLight: '#42A5F5', colorGold: '#FFC857' } },
  { name: 'Royal', colors: { colorNight: '#150F2E', colorNightLight: '#211848', colorAccent: '#7C5CFC', colorAccentLight: '#9A82FD', colorGold: '#F5B942' } },
];

export const HEX = /^#[0-9a-fA-F]{6}$/;

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      await connectDB();
      const doc = await SiteConfig.findOne({ key: 'main' }).lean();
      return { ...DEFAULT_SETTINGS, ...((doc?.data as Partial<SiteSettings>) ?? {}) };
    } catch { return DEFAULT_SETTINGS; }
  },
  ['site-settings'], { revalidate: 60, tags: ['site-config'] }
);

export const getHeroSlides = unstable_cache(
  async () => {
    try {
      await connectDB();
      const rows = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).limit(8).lean();
      return JSON.parse(JSON.stringify(rows)) as (typeof rows);
    } catch { return []; }
  },
  ['hero-slides'], { revalidate: 60, tags: ['site-config'] }
);

/** Variables CSS qui remplacent la palette Tailwind (@theme) à l'exécution. */
export function themeCss(s: SiteSettings): string {
  const v = (k: string, c: string) => (HEX.test(c) ? `${k}:${c};` : '');
  return `:root{${v('--color-night', s.colorNight)}${v('--color-night-light', s.colorNightLight)}${v('--color-night-lighter', s.colorNightLight)}${v('--color-night-deep', s.colorNight)}${v('--color-emerald-brand', s.colorAccent)}${v('--color-kpalime-green', s.colorAccent)}${v('--color-emerald-light', s.colorAccentLight)}${v('--color-kpalime-green-light', s.colorAccentLight)}${v('--color-gold', s.colorGold)}${v('--color-kpalime-earth', s.colorGold)}}body{background-color:var(--color-night)!important}`;
}
