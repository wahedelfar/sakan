import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { sessionToken } from '@/lib/sessionAuth';

function domainFrom(r: Request) {
  return (r.headers.get('x-forwarded-host') || r.headers.get('host') || 'sakan-egy.vercel.app').split(':')[0].toLowerCase();
}

export async function POST(r: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const b = await r.json().catch(() => ({}));
  const username = String(b.username || '').trim();
  const password = String(b.password || '');
  const domain = domainFrom(r);

  const { data: license, error: licenseError } = await supabase
    .from('licenses').select('is_active,expires_at').eq('domain', domain).maybeSingle();
  if (licenseError) return NextResponse.json({ ok:false, error:'تعذر التحقق من الاشتراك' }, { status:500 });
  if (license && (!license.is_active || (license.expires_at && new Date(license.expires_at).getTime() < Date.now()))) {
    return NextResponse.json({ ok:false, error:'اشتراك هذا الموقع غير نشط أو منتهي' }, { status:403 });
  }

  const { data } = await supabase
    .from('client_auth').select('username,password_hash').eq('tenant_domain', domain).maybeSingle();

  let valid = false;
  if (data?.password_hash) {
    try { valid = username === data.username && await bcrypt.compare(password, data.password_hash); } catch { valid = false; }
  } else {
    valid = username === 'waheed' && password === 'ahmedwaheed';
  }
  if (!valid) return NextResponse.json({ ok:false,error:'بيانات الدخول غير صحيحة' },{status:401});

  const res = NextResponse.json({ok:true,username:data?.username||username});
  res.cookies.set('sakan_admin', sessionToken('admin'), {
    httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*24*7
  });
  return res;
}