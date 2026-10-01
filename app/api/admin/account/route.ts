import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XY3KDQqMY0YkqqvceRQI4g_tjcaZgsG';
const supabase = createClient(url, key, { auth: { persistSession: false } });

function domainFrom(r: Request){
  return (r.headers.get('x-forwarded-host') || r.headers.get('host') || 'sakan-egy.vercel.app').split(':')[0].toLowerCase();
}

export async function POST(r: Request){
  const b = await r.json().catch(()=>({}));
  const username = String(b.username||'').trim();
  const newPassword = String(b.newPassword||'');
  const domain = domainFrom(r);

  if(username.length < 3 || newPassword.length < 6){
    return NextResponse.json({ ok: false, error: 'بيانات قصيرة' }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabase.from('client_auth').upsert({
    tenant_domain: domain,
    username,
    password_hash: hash,
    updated_at: new Date().toISOString()
  }, { onConflict: 'tenant_domain' });

  if(error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
