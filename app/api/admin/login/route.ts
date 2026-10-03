import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { sessionToken } from '@/lib/sessionAuth';
import { tenantDomainFromRequest, PRIMARY_DOMAIN } from '@/lib/tenant';

export async function POST(r: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const b = await r.json().catch(() => ({}));
  const username = String(b.username || '').trim();
  const password = String(b.password || '');
  const domain = tenantDomainFromRequest(r);

  // The primary Sakan site is the built-in/demo tenant and must keep
  // the documented first-login credentials working without a paid license.
  // Every other hostname is a customer tenant and must have an active license.
  if (domain !== PRIMARY_DOMAIN) {
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('status,is_active,expires_at')
      .eq('domain', domain)
      .maybeSingle();

    if (licenseError) {
      return NextResponse.json(
        { ok: false, error: 'تعذر التحقق من الاشتراك' },
        { status: 500 }
      );
    }

    const activeLicense =
      !!license &&
      license.is_active !== false &&
      license.status !== 'suspended' &&
      license.status !== 'expired' &&
      (!license.expires_at || new Date(license.expires_at).getTime() >= Date.now());

    if (!activeLicense) {
      return NextResponse.json(
        { ok: false, error: 'اشتراك هذا الموقع غير نشط أو غير مُفعّل' },
        { status: 403 }
      );
    }
  }

  const { data, error: authError } = await supabase
    .from('client_auth')
    .select('username,password_hash')
    .eq('tenant_domain', domain)
    .maybeSingle();

  if (authError) {
    return NextResponse.json(
      { ok: false, error: 'تعذر التحقق من بيانات الدخول' },
      { status: 500 }
    );
  }

  let valid = false;

  if (data?.password_hash) {
    try {
      valid =
        username === data.username &&
        await bcrypt.compare(password, data.password_hash);
    } catch {
      valid = false;
    }
  } else {
    // First-login default for the built-in tenant.
    // Customer tenants still require their own client_auth record.
    valid =
      domain === PRIMARY_DOMAIN &&
      username === 'waheed' &&
      password === 'ahmedwaheed';
  }

  if (!valid) {
    return NextResponse.json(
      { ok: false, error: 'بيانات الدخول غير صحيحة' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    username: data?.username || username
  });

  res.cookies.set('sakan_admin', sessionToken('admin'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
