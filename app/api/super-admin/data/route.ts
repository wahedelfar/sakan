import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

const SUPABASE_URL='https://apmopxvwxmwxwgxscbqt.supabase.co';
function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function isSuperAdmin(){return validSessionToken(cookies().get('sakan_super')?.value,'super');}

export async function GET(){
  if(!isSuperAdmin()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const s=db();
  const [licenses,settings,customers]=await Promise.all([
    s.from('licenses').select('*').order('created_at',{ascending:false}),
    s.from('settings').select('*').order('tenant_domain'),
    s.from('customers').select('id,name,phone,tenant_domain,created_at').order('created_at',{ascending:false})
  ]);
  const error=licenses.error||settings.error||customers.error;
  if(error)return NextResponse.json({error:error.message},{status:500});

  const rawCustomers=customers.data||[];
  const customerMap=new Map<string,any>();
  for(const c of rawCustomers){const key=`${c.tenant_domain||''}|${c.phone||c.id}`;if(!customerMap.has(key))customerMap.set(key,c);}
  const normalizedCustomers=Array.from(customerMap.values());

  const normalizedLicenses=(licenses.data||[]).map((l:any)=>({
    ...l,
    customer_name:l.client_name||'',
    customer_phone:l.phone||'',
    status:l.is_active===false?'suspended':(l.expires_at&&new Date(l.expires_at).getTime()<Date.now()?'expired':'active')
  }));

  return NextResponse.json({
    licenses:normalizedLicenses,
    settings:settings.data||[],
    customers:normalizedCustomers
  },{headers:{'Cache-Control':'no-store'}});
}
