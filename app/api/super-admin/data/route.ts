import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isSuperAdmin() {
  return cookies().get('sakan_super')?.value === '1';
}

export async function GET() {
  if (!isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const s = db();
  const [licenses, settings, bookings] = await Promise.all([
    s.from('licenses').select('*').order('created_at', { ascending: false }),
    s.from('settings').select('*').order('tenant_domain'),
    s.from('bookings').select('tenant_domain,customer_name,customer_phone').order('created_at', { ascending: false })
  ]);

  if (licenses.error || settings.error || bookings.error) {
    return NextResponse.json({
      error: licenses.error?.message || settings.error?.message || bookings.error?.message
    }, { status: 500 });
  }

  const seen = new Map<string, any>();
  for (const b of bookings.data || []) {
    const key = [b.tenant_domain || '', b.customer_phone || ''].join('|');
    if (!b.customer_phone || seen.has(key)) continue;
    seen.set(key, {
      id: key,
      name: b.customer_name || '',
      phone: b.customer_phone,
      tenant_domain: b.tenant_domain || ''
    });
  }

  return NextResponse.json({
    licenses: licenses.data || [],
    settings: settings.data || [],
    customers: Array.from(seen.values())
  }, { headers: { 'Cache-Control': 'no-store' } });
}
