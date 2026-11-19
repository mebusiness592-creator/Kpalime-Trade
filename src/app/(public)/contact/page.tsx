import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-config';
import { ContactForm } from '@/components/inquiry/ContactForm';

export const metadata: Metadata = { title: 'Contact' };
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-white">Nous contacter</h1>
        <p className="text-muted">Une question, une suggestion ou un partenariat ? Écrivez-nous : l’équipe {s.brandName} vous répond rapidement.</p>
        <ul className="space-y-3 text-white/90 text-sm">
          {s.email && <li className="flex gap-3"><Mail size={18} className="text-emerald-brand" /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
          {s.phone && <li className="flex gap-3"><Phone size={18} className="text-emerald-brand" /><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></li>}
          {s.address && <li className="flex gap-3"><MapPin size={18} className="text-emerald-brand" />{s.address}</li>}
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
