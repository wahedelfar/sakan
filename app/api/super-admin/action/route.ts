import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
function isSuperAdmin() {
  return cookies().get('sakan_super')?.value === '1';
}
function cleanDomain(value: unknown) {
  return String(value || '').trim().toLowerCase().split(':')[0];
}

export async function POST(req: Request) {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const s = db();

  if (action === 'license_save') {
    const id = body.id ? String(body.id) : '';
    const domain = cleanDomain(body.data?.domain);
    if (!domain) return NextResponse.json({ error: 'domain is required' }, { status: 400 });

    const payload = {
      customer_name: String(body.data?.customer_name || '').trim(),
      customer_phone: String(body.data?.customer_phone || '').trim(),
      domain,
      status: ['active', 'suspended', 'expired'].includes(body.data?.status) ? body.data.status : 'active',
      expires_at: body.data?.expires_at || null
    };

    const q = id
      ? s.from('licenses').update(payload).eq('id', id)
      : s.from('licenses').insert(payload);

    const { data, error } = await q.select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, license: data });
  }

  if (action === 'license_delete') {
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const { error } = await s.from('licenses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'settings_save') {
    const domain = cleanDomain(body.data?.tenant_domain);
    if (!domain) return NextResponse.json({ error: 'tenant_domain is required' }, { status: 400 });

    const payload = {
      tenant_domain: domain,
      brand_name: String(body.data?.brand_name || ''),
      whatsapp_number: String(body.data?.whatsapp_number || ''),
      vodafone_number: String(body.data?.vodafone_number || ''),
      instapay_ipn: String(body.data?.instapay_ipn || ''),
      logo_url: String(body.data?.logo_url || ''),
      primary_color: /^#[0-9a-fA-F]{6}$/.test(String(body.data?.primary_color || '')) ? body.data.primary_color : '#D4AF37',
      brand_edit_locked: body.data?.brand_edit_locked !== false
    };

    const { data, error } = await s.from('settings').upsert(payload, { onConflict: 'tenant_domain' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
