import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { validSessionToken } from '@/lib/sessionAuth';
import { tenantDomainFromRequest } from '@/lib/tenant';

export async function POST(r: Request){
  if(!validSessionToken(cookies().get('sakan_admin')?.value,'admin'))
    return NextResponse.json({ok:false,error:'Unauthorized'},{status:401});

  const supabase=createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL||'https://apmopxvwxmwxwgxscbqt.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {auth:{persistSession:false}}
  );
  const b=await r.json().catch(()=>({}));
  const newUsername=String(b.username||'').trim();
  const newPassword=String(b.password||'');
  const curUser=String(b.currentUsername||'').trim();
  const curPass=String(b.currentPassword||'');
  const domain=tenantDomainFromRequest(r);

  if(newUsername.length<3||newPassword.length<6)
    return NextResponse.json({ok:false,error:'اسم المستخدم قصير أو كلمة المرور أقل من 6'},{status:400});

  const {data:license,error:licenseError}=await supabase
    .from('licenses').select('status,is_active,expires_at').eq('domain',domain).maybeSingle();
  if(licenseError)return NextResponse.json({ok:false,error:'تعذر التحقق من الاشتراك'},{status:500});

  const activeLicense =
    !!license &&
    license.status !== 'suspended' &&
    license.status !== 'expired' &&
    license.is_active !== false &&
    (!license.expires_at || new Date(license.expires_at).getTime() >= Date.now());

  if(!activeLicense)
    return NextResponse.json({ok:false,error:'اشتراك هذا الموقع غير نشط أو غير مُفعّل'},{status:403});

  const {data:row}=await supabase.from('client_auth')
    .select('username,password_hash')
    .eq('tenant_domain',domain)
    .maybeSingle();

  const validCurrent=row?.password_hash
    ? curUser===row.username&&await bcrypt.compare(curPass,row.password_hash)
    : curUser==='waheed'&&curPass==='ahmedwaheed';

  if(!validCurrent)return NextResponse.json({ok:false,error:'كلمة المرور الحالية غير صحيحة'},{status:401});

  const hash=await bcrypt.hash(newPassword,12);
  const {error}=await supabase.from('client_auth').upsert(
    {tenant_domain:domain,username:newUsername,password_hash:hash,updated_at:new Date().toISOString()},
    {onConflict:'tenant_domain'}
  );
  if(error)return NextResponse.json({ok:false,error:error.message},{status:500});
  return NextResponse.json({ok:true,username:newUsername});
}