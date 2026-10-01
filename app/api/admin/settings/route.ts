export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function isSuperAdmin() {
  return cookies().get('sakan_super')?.value === '1';
}

export async function GET(req: Request) {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const supabase = getSupabase();

  if (searchParams.get('all') === '1') {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('tenant_domain');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ error: 'Use ?all=1' }, { status: 400 });
}

export async function POST(req: Request) {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const domain = String(body.tenant_domain || '').trim().toLowerCase();
  if (!domain) return NextResponse.json({ error: 'tenant_domain is required' }, { status: 400 });

  const supabase = getSupabase();
  const payload = {
    tenant_domain: domain,
    brand_name: body.brand_name || '',
    whatsapp_number: body.whatsapp_number || '',
    vodafone_number: body.vodafone_number || '',
    instapay_ipn: body.instapay_ipn || '',
    logo_url: body.logo_url || ''
  };

  const { data, error } = await supabase
    .from('settings')
    .upsert(payload, { onConflict: 'tenant_domain' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
