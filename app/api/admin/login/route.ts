import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';

function domainFrom(r: Request) {
  return (r.headers.get('x-forwarded-host') || r.headers.get('host') || 'sakan-egy.vercel.app').split(':')[0].toLowerCase();
}

export async function POST(r: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const b = await r.json().catch(() => ({}));
  const username = String(b.username || '').trim();
  const password = String(b.password || '');
  const domain = domainFrom(r);

  let data: { username: string; password_hash: string } | null = null;
  try {
    const { data: row } = await supabase.from('client_auth').select('username,password_hash').eq('tenant_domain', domain).maybeSingle();
    data = row as any;
  } catch { data = null; }

  let valid = false;
  if (data?.password_hash) {
    try { valid = username === data.username && await bcrypt.compare(password, data.password_hash); } catch { valid = false; }
  } else {
    valid = username === 'waheed' && password === 'ahmedwaheed';
  }

  if (!valid) return NextResponse.json({ ok:false,error:'بيانات الدخول غير صحيحة' },{status:401});
  const res=NextResponse.json({ok:true,username:data?.username||username});
  res.cookies.set('sakan_admin','1',{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*24*7});
  return res;
}
