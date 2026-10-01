import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';

function domainFrom(r: Request){
  return (r.headers.get('x-forwarded-host') || r.headers.get('host') || 'sakan-egy.vercel.app').split(':')[0].toLowerCase();
}

export async function POST(r: Request){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth:{ persistSession:false } });

  const b = await r.json().catch(()=>({}));
  const newUsername = String(b.username||'').trim();
  const newPassword = String(b.password||'');
  const curUser = String(b.currentUsername||'').trim();
  const curPass = String(b.currentPassword||'');
  const domain = domainFrom(r);

  if(newUsername.length < 3 || newPassword.length < 6){
    return NextResponse.json({ ok:false, error:'اسم المستخدم قصير أو كلمة المرور أقل من 6' }, { status:400 });
  }

  let row = null;
  try {
    const { data } = await supabase.from('client_auth').select('username,password_hash').eq('tenant_domain', domain).maybeSingle();
    row = data;
  } catch { row = null; }

  let validCurrent = false;
  if(row?.password_hash){
    validCurrent = curUser === row.username && await bcrypt.compare(curPass, row.password_hash);
  } else {
    validCurrent = curUser === 'waheed' && curPass === 'ahmedwaheed';
  }

  if(!validCurrent){
    return NextResponse.json({ ok:false, error:'كلمة المرور الحالية غير صحيحة' }, { status:401 });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  const { error } = await supabase.from('client_auth').upsert({
    tenant_domain: domain,
    username: newUsername,
    password_hash: hash,
    updated_at: new Date().toISOString()
  }, { onConflict: 'tenant_domain' });

  if(error){
    return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  }

  return NextResponse.json({ ok:true, username: newUsername });
}
