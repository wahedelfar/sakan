import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
function admin(){return validSessionToken(cookies().get('sakan_admin')?.value,'admin');}

export async function POST(req:Request){
  if(!admin())return NextResponse.json({error:'Unauthorized'},{status:401});
  const domain=host(req),body=await req.json().catch(()=>({})),s=db(),action=String(body.action||'');

  if(action==='booking_status'){
    const {id,status}=body;
    if(!id||!status)return NextResponse.json({error:'بيانات ناقصة'},{status:400});
    if(!['معلق','مؤكد','ملغي'].includes(status))return NextResponse.json({error:'حالة حجز غير صالحة'},{status:400});
    const {data:b,error}=await s.from('bookings').update({status}).eq('id',id).eq('tenant_domain',domain).select('property_id').single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    if(b?.property_id)await s.from('properties').update({status:status==='مؤكد'?'محجوز':status==='مرفوض'||status==='ملغي'?'متاح':'محجوز جزئيا'}).eq('id',b.property_id).eq('tenant_domain',domain);
    return NextResponse.json({ok:true});
  }

  if(action==='booking_delete'){
    const id=String(body.id||'');if(!id)return NextResponse.json({error:'id required'},{status:400});
    const {data:b,error}=await s.from('bookings').select('property_id,status').eq('id',id).eq('tenant_domain',domain).single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    const {error:delError}=await s.from('bookings').delete().eq('id',id).eq('tenant_domain',domain);
    if(delError)return NextResponse.json({error:delError.message},{status:500});
    if(b?.property_id&&b.status==='مؤكد'){
      const {data:remaining}=await s.from('bookings').select('id').eq('property_id',b.property_id).eq('tenant_domain',domain).eq('status','مؤكد').limit(1);
      if(!remaining?.length)await s.from('properties').update({status:'متاح'}).eq('id',b.property_id).eq('tenant_domain',domain);
    }
    return NextResponse.json({ok:true});
  }

  if(action==='customer_delete'){
    const id=String(body.id||'');if(!id)return NextResponse.json({error:'id required'},{status:400});
    const {error}=await s.from('customers').delete().eq('id',id).eq('tenant_domain',domain);
    if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
  }

  if(action==='property_save'){
    const data={...(body.data||{}),tenant_domain:domain};
    const q=data.id?s.from('properties').update(data).eq('id',data.id).eq('tenant_domain',domain):s.from('properties').insert(data);
    const {error}=await q;if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
  }

  if(action==='property_delete'){
    const {id}=body;if(!id)return NextResponse.json({error:'id required'},{status:400});
    const {error}=await s.from('properties').delete().eq('id',id).eq('tenant_domain',domain);
    if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
  }

  if(action==='section_save'){
    const name=String(body.name||'').trim();if(!name)return NextResponse.json({error:'اسم القسم مطلوب'},{status:400});
    const data={name,tenant_domain:domain};
    const q=body.id?s.from('sections').update(data).eq('id',String(body.id)).eq('tenant_domain',domain):s.from('sections').insert(data);
    const {error}=await q;if(error)return NextResponse.json({error:error.code==='23505'?'القسم موجود بالفعل':error.message},{status:500});return NextResponse.json({ok:true});
  }

  if(action==='section_delete'){
    const id=String(body.id||'');if(!id)return NextResponse.json({error:'id required'},{status:400});
    const {error}=await s.from('sections').delete().eq('id',id).eq('tenant_domain',domain);
    if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
  }

  if(action==='theme'){
    const color=String(body.primary_color||'').trim();
    if(!/^#[0-9A-Fa-f]{6}$/.test(color))return NextResponse.json({error:'لون غير صالح'},{status:400});
    const {error}=await s.from('settings').update({primary_color:color}).eq('tenant_domain',domain);
    if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
  }

  return NextResponse.json({error:'Unknown action'},{status:400});
}