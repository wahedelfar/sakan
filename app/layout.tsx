import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { supabase } from '../lib/supabaseClient';

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'sakan-egy.vercel.app';
  const domain = host.split(':')[0].toLowerCase();

  const { data: brand } = await supabase
    .from('settings')
    .select('*')
    .eq('tenant_domain', domain)
    .maybeSingle();

  const clientName = brand?.client_name || brand?.brand_name || 'سكن';
  const area = brand?.area || brand?.location || 'مصر';
  const logoUrl = brand?.logo_url || null;
  const title = `${clientName} | شقق للايجار في ${area}`;
  const description = `احجز شقق مفروشة في ${area} بأفضل سعر - ${clientName}`;
  const ogImage = `https://${domain}/api/og?domain=${encodeURIComponent(domain)}`;

  return {
    metadataBase: new URL(`https://${domain}`),
    title,
    description,
    alternates: { canonical: `https://${domain}` },
    openGraph: {
      title: clientName,
      description: `شقق للايجار في ${area}`,
      url: `https://${domain}`,
      siteName: clientName,
      type: 'website',
      locale: 'ar_EG',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: clientName
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: clientName,
      description: `شقق للايجار في ${area}`,
      images: [ogImage]
    },
    icons: logoUrl ? { icon: logoUrl } : undefined
  };
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}