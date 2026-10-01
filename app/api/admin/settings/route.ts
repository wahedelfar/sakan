export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
function isSuperAdmin() {
  return validSessionToken(cookies().get('sakan_super')?.value, 'super');
}

export async function GET(req: Request) {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  if (searchParams.get('all') !== '1') return NextResponse.json({ error: 'Use ?all=1' }, { status: 400 });
  const { data, error } = await getSupabase().from('settings').select('*').order('tenant_domain');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const domain = String(body.tenant_domain || '').trim().toLowerCase();
  if (!domain) return NextResponse.json({ error: 'tenant_domain is required' }, { status: 400 });
  const payload = {
    tenant_domain: domain,
    brand_name: String(body.brand_name || ''),
    whatsapp_number: String(body.whatsapp_number || ''),
    vodafone_number: String(body.vodafone_number || ''),
    instapay_ipn: String(body.instapay_ipn || ''),
    logo_url: String(body.logo_url || ''),
    primary_color: /^#[0-9a-fA-F]{6}$/.test(String(body.primary_color || '')) ? body.primary_color : '#D4AF37',
    brand_edit_locked: true
  };
  const { data, error } = await getSupabase().from('settings').upsert(payload, { onConflict: 'tenant_domain' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
