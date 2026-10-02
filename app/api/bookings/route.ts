import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
export async function POST(req:Request){
 const domain=host(req),body=await req.json().catch(()=>({})),s=db();
 const required=['property_id','customer_name','customer_phone','check_in','check_out','payment_method'];
 if(required.some(k=>!body[k]))return NextResponse.json({error:'أكمل بيانات الحجز'},{status:400});
 let {data:property,error:pe}=await s.from('properties').select('*').eq('id',body.property_id).eq('tenant_domain',domain).maybeSingle();
 // توافق مع العقارات القديمة التي أُنشئت قبل إضافة tenant_domain، للمتجر الرئيسي فقط.
 if(!property && domain==='sakan-egy.vercel.app'){
  const legacy=await s.from('properties').select('*').eq('id',body.property_id).is('tenant_domain',null).maybeSingle();
  property=legacy.data; pe=legacy.error;
 }
 if(pe||!property)return NextResponse.json({error:'العقار غير متاح لهذا النطاق'},{status:404});
 const {data:conflicts}=await s.from('bookings').select('id,check_in,check_out').eq('tenant_domain',domain).eq('property_id',body.property_id).eq('status','مؤكد').lt('check_in',body.check_out).gt('check_out',body.check_in);
 if(conflicts?.length)return NextResponse.json({error:'الفترة المختارة تتداخل مع حجز مؤكد'},{status:409});
 let receipt_url=null,receipt_warning=null;
 if(body.receipt_name&&body.receipt_base64){try{const raw=String(body.receipt_base64).split(',').pop()||'',buf=Buffer.from(raw,'base64');const safe=String(body.receipt_name).replace(/[^a-zA-Z0-9._-]/g,'_');const path=domain+'/receipts/'+Date.now()+'-'+safe;const up=await s.storage.from('property-images').upload(path,buf,{contentType:body.receipt_type||'image/jpeg',upsert:false});if(up.error)receipt_warning=up.error.message;else receipt_url=s.storage.from('property-images').getPublicUrl(path).data.publicUrl}catch(e){receipt_warning='تعذر حفظ الإيصال، لكن تم حفظ الحجز'}}
 const nights=Math.max(1,Math.ceil((new Date(body.check_out).getTime()-new Date(body.check_in).getTime())/86400000));
 const total=nights*Number(property.price_per_night||0),deposit=Number(property.deposit_amount||property.price_per_night||0);
 const paymentTotal=body.payment_type==='عربون فقط'?deposit:total;
 const bookingId=crypto.randomUUID();
 const booking={id:bookingId,property_id:property.id,tenant_domain:domain,customer_name:String(body.customer_name),customer_phone:String(body.customer_phone),check_in:body.check_in,check_out:body.check_out,total_price:paymentTotal,payment_method:body.payment_method,receipt_url,status:'معلق',payment_type:body.payment_type||'كامل',deposit_paid:body.payment_type==='عربون فقط',arrival_time:body.arrival_time||'09:00'};
 const {error}=await s.from('bookings').insert(booking);
 if(error)return NextResponse.json({error:error.message},{status:500});
 let customerWarning=null;
 try{const customerResult=await s.from('customers').upsert({name:String(body.customer_name),phone:String(body.customer_phone),tenant_domain:domain},{onConflict:'tenant_domain,phone'});customerWarning=customerResult.error?.message||null}catch(e){customerWarning='تعذر تحديث بيانات العميل'}
 return NextResponse.json({booking:{id:booking.id},customer_warning:customerWarning,receipt_warning},{status:201});
}