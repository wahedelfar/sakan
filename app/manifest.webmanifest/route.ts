import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tenantDomainFromRequest } from '@/lib/tenant';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  const domain = tenantDomainFromRequest(req);
  const supabase = db();
  const { data } = await supabase
    .from('settings')
    .select('brand_name,logo_url')
    .eq('tenant_domain', domain)
    .maybeSingle();

  const name = String(data?.brand_name || 'سكن').trim() || 'سكن';
  const icon192 = new URL('/api/public/app-icon?size=192', req.url).toString();
  const icon512 = new URL('/api/public/app-icon?size=512', req.url).toString();

  return NextResponse.json(
    {
      name,
      short_name: name,
      description: name,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'ar',
      dir: 'rtl',
      theme_color: '#D4AF37',
      background_color: '#090a0c',
      icons: [
        { src: icon192, sizes: '192x192', purpose: 'any maskable' },
        { src: icon512, sizes: '512x512', purpose: 'any maskable' }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
