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

function fallbackIcon(size: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#090a0c"/>
    <text x="50%" y="58%" text-anchor="middle" font-family="Arial,sans-serif" font-size="${Math.round(size * 0.48)}" font-weight="700" fill="#D4AF37">س</text>
  </svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store, max-age=0' }
  });
}

export async function GET(req: Request) {
  const domain = tenantDomainFromRequest(req);
  const sizeParam = new URL(req.url).searchParams.get('size');
  const size = sizeParam === '512' ? 512 : 192;

  const { data } = await db()
    .from('settings')
    .select('logo_url')
    .eq('tenant_domain', domain)
    .maybeSingle();

  const logoUrl = String(data?.logo_url || '').trim();
  if (!logoUrl) return fallbackIcon(size);

  try {
    const response = await fetch(logoUrl, { cache: 'no-store' });
    if (!response.ok) return fallbackIcon(size);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return fallbackIcon(size);
    const bytes = await response.arrayBuffer();
    return new Response(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch {
    return fallbackIcon(size);
  }
}
