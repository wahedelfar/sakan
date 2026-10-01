import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XY3KDQqMY0YkqqvceRQI4g_tjcaZgsG';
const supabase = createClient(url, key, { auth: { persistSession: false } });

function domainFrom(r: Request) {
  return (r.headers.get('x-forwarded-host') || r.headers.get('host') || 'sakan-egy.vercel.app')
   .split(':')[0]
   .toLowerCase();
}

export async function POST(r: Request) {
  const b = await r.json().catch(() => ({}));
  const username = String(b.username || '');
  const password = String(b.password || '');
  const domain = domainFrom(r);

  const { data, error } = await supabase
   .from('client_auth')
   .select('username,password_hash')
   .eq('tenant_domain', domain)
   .maybeSingle();

  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  const valid = data
   ? username === data.username && await bcrypt.compare(password, data.password_hash)
    : username === 'waheed' && password === 'ahmedwaheed';

  if (!valid) return NextResponse.json({ ok: false }, { status: 401 });

  const res = NextResponse.json({ ok: true, username: data?.username || username });
  res.cookies.set('sakan_admin', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 604800
  });
  return res;
}
