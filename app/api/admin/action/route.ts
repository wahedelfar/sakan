import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
export async function POST(req:Request){
 if(cookies().get('sakan_admin')?.value!=='1')return NextResponse.json({error:'Unauthorized'},{status:401});
 const domain=host(req),body=await req.json().catch(()=>({})),s=db(),action=body.action;
 if(action==='booking_status'){
  const {id,status}=body; if(!id||!status)return NextResponse.json({error:'بيانات ناقصة'},{status:400});
  const {data:b,error}=await s.from('bookings').update({status}).eq('id',id).eq('tenant_domain',domain).select('property_id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  if(b?.property_id)await s.from('properties').update({status:status==='مؤكد'?'محجوز':status==='مرفوض'||status==='ملغي'?'متاح':'محجوز جزئيا'}).eq('id',b.property_id).eq('tenant_domain',domain);
  return NextResponse.json({ok:true});
 }
 if(action==='property_save'){
  const data={...(body.data||{}),tenant_domain:domain};
  const q=data.id?s.from('properties').update(data).eq('id',data.id).eq('tenant_domain',domain):s.from('properties').insert(data);
  const {error}=await q; if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({ok:true});
 }
 if(action==='property_delete'){
  const {id}=body;if(!id)return NextResponse.json({error:'id required'},{status:400});
  const {error}=await s.from('properties').delete().eq('id',id).eq('tenant_domain',domain);if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
 }
 if(action==='theme'){
  const color=String(body.primary_color||'').trim();if(!/^#[0-9A-Fa-f]{6}$/.test(color))return NextResponse.json({error:'لون غير صالح'},{status:400});
  const {error}=await s.from('settings').update({primary_color:color}).eq('tenant_domain',domain);if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
 }
 return NextResponse.json({error:'Unknown action'},{status:400});
}