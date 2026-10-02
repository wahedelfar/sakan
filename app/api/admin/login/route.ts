import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { sessionToken } from '@/lib/sessionAuth';
import { tenantDomainFromRequest } from '@/lib/tenant';

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

  // The default credentials are intentionally retained for first login,
  // but only a licensed tenant can use them.
  const { data: license, error: licenseError } = await supabase
    .from('licenses')
    .select('is_active,expires_at')
    .eq('domain', domain)
    .maybeSingle();

  if (licenseError) return NextResponse.json({ ok:false, error:'تعذر التحقق من الاشتراك' }, { status:500 });

  const activeLicense =
    !!license &&
    license.is_active !== false &&
    (!license.expires_at || new Date(license.expires_at).getTime() >= Date.now());

  if (!activeLicense) {
    return NextResponse.json({ ok:false, error:'اشتراك هذا الموقع غير نشط أو غير مُفعّل' }, { status:403 });
  }

  const { data } = await supabase
    .from('client_auth')
    .select('username,password_hash')
    .eq('tenant_domain', domain)
    .maybeSingle();

  let valid = false;
  if (data?.password_hash) {
    try {
      valid = username === data.username && await bcrypt.compare(password, data.password_hash);
    } catch {
      valid = false;
    }
  } else {
    // First-login default: the owner changes this from the tenant admin panel.
    valid = username === 'waheed' && password === 'ahmedwaheed';
  }

  if (!valid) return NextResponse.json({ ok:false,error:'بيانات الدخول غير صحيحة' },{status:401});

  const res = NextResponse.json({ok:true,username:data?.username||username});
  res.cookies.set('sakan_admin', sessionToken('admin'), {
    httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*24*7
  });
  return res;
}