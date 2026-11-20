import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { getSiteSettings, themeCss } from '@/lib/site-config';
import { getTaxonomy } from '@/lib/taxonomy';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ClientProviders } from '@/components/layout/ClientProviders';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteSettings();
  const name = cfg.brandName || APP_NAME;
  return {
    title: { default: name, template: `%s | ${name}` },
    description: APP_DESCRIPTION,
    manifest: '/manifest.json',
    icons: cfg.logoUrl ? { icon: cfg.logoUrl } : undefined,
    appleWebApp: { capable: true, statusBarStyle: 'default', title: name },
    openGraph: { title: name, description: APP_DESCRIPTION, url: process.env.NEXT_PUBLIC_APP_URL || 'https://kpalime-trade.vercel.app', siteName: name, images: [{ url: cfg.logoUrl || '/og-default.svg', width: 1200, height: 630, alt: name }], locale: 'fr_FR', type: 'website' },
    twitter: { card: 'summary_large_image', title: name, description: APP_DESCRIPTION },
  };
}

export const viewport: Viewport = {
  themeColor: '#071A2B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteSettings();
  const cats = await getTaxonomy('product');
  return (
    <html lang="fr" className={inter.className}>
      <head><style dangerouslySetInnerHTML={{ __html: themeCss(cfg) }} /></head>
      <body className="min-h-screen flex flex-col pb-16 lg:pb-0 bg-gray-50">
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <ToastProvider>
                <Header brandName={cfg.brandName} logoUrl={cfg.logoUrl || undefined} announcement={cfg.announcement || undefined} categories={cats.map((c) => ({ slug: c.slug, label: c.label }))} />
                <main className="flex-1">
                  <ClientProviders>{children}</ClientProviders>
                </main>
                <Footer />
                <MobileNav />
              </ToastProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}