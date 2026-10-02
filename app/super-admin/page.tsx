'use client';
import { useEffect, useMemo, useState } from 'react';

type License = {
  id:string;
  customer_name?:string;
  customer_phone?:string;
  domain?:string;
  status:string;
  expires_at?:string|null;
  created_at?:string;
  is_active?:boolean;
  subscription_amount?:number|null;
  payment_status?:'paid'|'unpaid'|'pending'|'overdue'|'waived'|string;
  payment_date?:string|null;
  payment_method?:string|null;
  payment_reference?:string|null;
  notes?:string|null;
};

const emptyLicense = {
  customer_name:'', customer_phone:'', domain:'', status:'active', expires_at:'',
  subscription_amount:'', payment_status:'unpaid', payment_date:'', payment_method:'', payment_reference:'', notes:''
};

const paymentMeta:any = {
  paid:{label:'مدفوع',cls:'text-emerald-300'},
  unpaid:{label:'غير مدفوع',cls:'text-red-300'},
  pending:{label:'قيد التحصيل',cls:'text-yellow-200'},
  overdue:{label:'متأخر',cls:'text-red-300'},
  waived:{label:'معفى',cls:'text-white/60'}
};
function money(v?:number|null){
  if(v===null || v===undefined) return 'غير محدد';
  return new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(v)+' ج.م';
}

function daysLeft(date?:string|null){
  if(!date) return null;
  return Math.ceil((new Date(date).getTime()-Date.now())/86400000);
}
function statusMeta(l:License){
  const d=daysLeft(l.expires_at);
  if(l.status==='suspended') return {label:'موقوف',cls:'bg-red-500/15 text-red-300'};
  if(d!==null && d<0) return {label:'منتهي',cls:'bg-red-500/15 text-red-300'};
  if(d!==null && d<=30) return {label:'ينتهي قريباً',cls:'bg-yellow-500/15 text-yellow-200'};
  return {label:'نشط',cls:'bg-emerald-500/15 text-emerald-300'};
}
function fmtDate(v?:string|null){
  if(!v) return 'غير محدد';
  return new Date(v).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
}

export default function SuperAdmin() {
  const [ready,setReady]=useState(false);
  const [tab,setTab]=useState<'dashboard'|'brand'|'licenses'>('dashboard');
  const [licenses,setLicenses]=useState<License[]>([]);
  const [allSettings,setAllSettings]=useState<any[]>([]);
  const [settings,setSettings]=useState<any>({});
  const [license,setLicense]=useState<any>(emptyLicense);
  const [licenseError,setLicenseError]=useState('');
  const [notice,setNotice]=useState('');

  const load=async()=>{
    const r=await fetch('/api/super-admin/data',{cache:'no-store'});
    if(r.status===401){location.href='/super-admin/login';return;}
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setLicenseError(j.error||'تعذر تحميل البيانات');return;}
    setLicenses(j.licenses||[]);
    setAllSettings(j.settings||[]);
    setSettings((old:any)=>old.tenant_domain?old:(j.settings?.[0]||{}));
  };

  useEffect(()=>{(async()=>{await load();setReady(true)})()},[]);

  const stats=useMemo(()=>{
    const active=licenses.filter(l=>statusMeta(l).label==='نشط').length;
    const soon=licenses.filter(l=>statusMeta(l).label==='ينتهي قريباً').length;
    const expired=licenses.filter(l=>statusMeta(l).label==='منتهي').length;
    const suspended=licenses.filter(l=>statusMeta(l).label==='موقوف').length;
    const paid=licenses.filter(l=>l.payment_status==='paid');
    const collected=paid.reduce((sum,l)=>sum+(Number(l.subscription_amount)||0),0);
    const outstanding=licenses.filter(l=>['unpaid','pending','overdue'].includes(String(l.payment_status))).reduce((sum,l)=>sum+(Number(l.subscription_amount)||0),0);
    return {total:licenses.length,active,soon,expired,suspended,collected,outstanding};
  },[licenses]);

  const saveLicense=async()=>{
    if(!license.customer_name && !license.domain)return alert('أدخل اسم العميل أو النطاق');
    const r=await fetch('/api/super-admin/action',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'license_save',id:license.id||null,data:{...license,expires_at:license.expires_at||null,payment_date:license.payment_date||null,subscription_amount:license.subscription_amount===''?null:Number(license.subscription_amount)||0,payment_reference:license.payment_reference||null,payment_method:license.payment_method||null,notes:license.notes||null}})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر حفظ الترخيص');
    setLicense(emptyLicense);setNotice('تم حفظ اشتراك العميل بنجاح');await load();setTab('dashboard');
  };

  const deleteLicense=async(id:string)=>{
    if(!confirm('حذف الترخيص فقط؟ لن يتم حذف بيانات الموقع.'))return;
    const r=await fetch('/api/super-admin/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'license_delete',id})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر الحذف');
    await load();
  };

  const saveBrand=async()=>{
    if(!settings.tenant_domain)return alert('اكتب الدومين - مثال: sakan-egy.vercel.app');
    const r=await fetch('/api/super-admin/action',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'settings_save',data:settings})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر حفظ الإعدادات');
    setNotice('تم حفظ إعدادات '+settings.tenant_domain);await load();
  };

  const logout=async()=>{
    await fetch('/api/super-admin/logout',{method:'POST'});
    localStorage.removeItem('isSuperAdmin');
    location.href='/';
  };

  if(!ready)return <main className="min-h-screen grid place-items-center">جاري التحقق...</main>;

  return <main className="min-h-screen p-4 md:p-6">
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="gold text-3xl font-extrabold">سكن — الإدارة العليا</h1>
          <div className="text-white/45 mt-1">مركز التحكم المركزي بجميع العملاء والمواقع والاشتراكات</div>
        </div>
        <button onClick={logout} className="bg-white/10 hover:bg-white/15 rounded-xl px-4 py-2">خروج</button>
      </header>

      <nav className="glass rounded-2xl p-2 grid grid-cols-3 gap-2 mb-6">
        {([['dashboard','لوحة العملاء'],['brand','المواقع والإعدادات'],['licenses','الاشتراكات']] as const).map(([k,l])=>
          <button key={k} onClick={()=>setTab(k)} className={`px-3 py-3 rounded-xl transition ${tab===k?'bg-[#D4AF37] text-black font-bold':'bg-white/5 hover:bg-white/10'}`}>{l}</button>
        )}
      </nav>

      {notice&&<div className="mb-4 glass rounded-xl p-3 border border-[#D4AF37]/30">{notice}<button onClick={()=>setNotice('')} className="float-left">×</button></div>}

      {tab==='dashboard'&&<section>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            ['إجمالي العملاء',stats.total,'text-white'],
            ['نشط',stats.active,'text-emerald-300'],
            ['ينتهي قريباً',stats.soon,'text-yellow-200'],
            ['منتهي',stats.expired,'text-red-300'],
            ['موقوف',stats.suspended,'text-red-300'],
            ['المحصّل',money(stats.collected),'text-emerald-300'],
            ['المستحق',money(stats.outstanding),'text-yellow-200']
          ].map(([label,value,cls])=><div key={String(label)} className="glass rounded-2xl p-4"><div className="text-white/50 text-sm">{label}</div><div className={`text-2xl font-extrabold mt-1 ${cls}`}>{value}</div></div>)}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div><h2 className="text-xl font-bold">العملاء</h2><p className="text-white/40 text-sm">كل عميل معزول عن الآخر بالدومين الخاص به</p></div>
          <button onClick={()=>{setLicense(emptyLicense);setTab('licenses')}} className="btn-gold rounded-xl px-4 py-2 font-bold">+ إضافة عميل</button>
        </div>

        {licenses.length===0 ? <div className="glass rounded-2xl p-10 text-center text-white/50">لا يوجد عملاء مسجلون حالياً.</div> :
        <div className="grid lg:grid-cols-2 gap-4">
          {licenses.map(l=>{
            const s=statusMeta(l), d=daysLeft(l.expires_at);
            const site=allSettings.find(x=>String(x.tenant_domain||'').toLowerCase()===String(l.domain||'').toLowerCase());
            return <article key={l.id} className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold">{l.customer_name||'عميل بدون اسم'}</div>
                  <div className="text-white/45 text-sm dir-ltr text-right">{l.domain||'بدون دومين'}</div>
                </div>
                <span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-white/5 p-3"><div className="text-white/40 text-xs">بداية الاشتراك</div><div className="font-semibold mt-1">{fmtDate(l.created_at)}</div></div>
                <div className="rounded-xl bg-white/5 p-3"><div className="text-white/40 text-xs">تاريخ الانتهاء</div><div className="font-semibold mt-1">{fmtDate(l.expires_at)}</div></div>
                <div className="rounded-xl bg-white/5 p-3"><div className="text-white/40 text-xs">المدة المتبقية</div><div className="font-semibold mt-1">{d===null?'غير محددة':d<0?`منتهية منذ ${Math.abs(d)} يوم`:d===0?'تنتهي اليوم':`${d} يوم`}</div></div>
                <div className="rounded-xl bg-white/5 p-3"><div className="text-white/40 text-xs">حالة الموقع</div><div className="font-semibold mt-1">{site?'مهيأ وجاهز':'يحتاج إعداد'}</div></div>
              </div>

              <div className="mt-4 rounded-xl bg-white/5 p-3 grid grid-cols-2 gap-3">
                <div><div className="text-white/40 text-xs">الاشتراك</div><div className="font-semibold mt-1">{money(l.subscription_amount)}</div></div>
                <div><div className="text-white/40 text-xs">حالة الدفع</div><div className={`font-semibold mt-1 ${paymentMeta[l.payment_status||'unpaid']?.cls||'text-white'}`}>{paymentMeta[l.payment_status||'unpaid']?.label||l.payment_status||'غير مسجل'}</div></div>
                <div><div className="text-white/40 text-xs">تاريخ الدفع</div><div className="font-semibold mt-1">{fmtDate(l.payment_date)}</div></div>
                <div><div className="text-white/40 text-xs">طريقة الدفع</div><div className="font-semibold mt-1">{l.payment_method||'غير محددة'}</div></div>
              </div>
              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="text-white/40">مرجع الدفع: {l.payment_reference||'—'}</span>
                {l.customer_phone&&<a href={`tel:${l.customer_phone}`} className="text-[#D4AF37]">{l.customer_phone}</a>}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={()=>{setLicense({...l,expires_at:l.expires_at?.slice(0,10)||''});setTab('licenses')}} className="bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2">إدارة الاشتراك</button>
                <button onClick={()=>{const x=site||{tenant_domain:l.domain||''};setSettings(x);setTab('brand')}} className="bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2">إعدادات الموقع</button>
                {l.domain&&<a href={`https://${l.domain}`} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2">فتح الموقع ↗</a>}
              </div>
            </article>
          })}
        </div>}
      </section>}

      {tab==='brand'&&<section className="space-y-5">
        <div className="glass rounded-2xl p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">إعدادات موقع العميل</h2>
          <label className="block text-sm mb-3"><span className="block mb-1 text-[#D4AF37] font-bold">الدومين * (مفتاح العزل)</span><input value={settings.tenant_domain||''} onChange={e=>setSettings({...settings,tenant_domain:e.target.value.toLowerCase().trim()})} placeholder="sakan-egy.vercel.app أو client.com" className="w-full rounded-xl bg-white/10 p-3 border border-[#D4AF37]/30"/></label>
          {[['brand_name','اسم البراند'],['whatsapp_number','واتساب'],['vodafone_number','فودافون كاش'],['instapay_ipn','InstaPay IPN'],['logo_url','رابط الشعار']].map(([k,l])=><label key={k} className="block text-sm mb-3"><span className="block mb-1 text-white/70">{l}</span><input value={settings[k]||''} onChange={e=>setSettings({...settings,[k]:e.target.value})} className="w-full rounded-xl bg-white/10 p-3"/></label>)}
          <button onClick={saveBrand} className="btn-gold rounded-xl px-6 py-3 mt-2 w-full">حفظ إعدادات الموقع</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">{allSettings.map((r:any)=><div key={r.id} className="glass rounded-2xl p-4 flex justify-between gap-3"><div><b className="gold">{r.brand_name||'بدون اسم'}</b><div className="text-white/50 text-sm">{r.tenant_domain}</div><div className="text-xs mt-1">{r.whatsapp_number||''} {r.vodafone_number?'| '+r.vodafone_number:''}</div></div><button onClick={()=>setSettings(r)} className="bg-white/10 rounded-lg px-4 py-2 h-fit">تعديل</button></div>)}</div>
      </section>}

      {tab==='licenses'&&<section>
        <div className="glass rounded-2xl p-5 mb-5">
          <h2 className="text-xl font-bold mb-4">{license.id?'تعديل اشتراك':'إضافة عميل / اشتراك'}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={license.customer_name||''} onChange={e=>setLicense({...license,customer_name:e.target.value})} placeholder="اسم العميل" className="rounded-xl bg-white/10 p-3"/>
            <input value={license.customer_phone||''} onChange={e=>setLicense({...license,customer_phone:e.target.value})} placeholder="هاتف العميل" className="rounded-xl bg-white/10 p-3"/>
            <input value={license.domain||''} onChange={e=>setLicense({...license,domain:e.target.value})} placeholder="النطاق" className="rounded-xl bg-white/10 p-3"/>
            <select value={license.status||'active'} onChange={e=>setLicense({...license,status:e.target.value})} className="rounded-xl bg-white/10 p-3"><option value="active">نشط</option><option value="suspended">موقوف</option><option value="expired">منتهي</option></select>
            <label className="text-sm">تاريخ الانتهاء<input type="date" value={license.expires_at||''} onChange={e=>setLicense({...license,expires_at:e.target.value})} className="mt-1 w-full rounded-xl bg-white/10 p-3"/></label>
            <label className="text-sm">قيمة الاشتراك (ج.م)<input type="number" min="0" step="0.01" value={license.subscription_amount??''} onChange={e=>setLicense({...license,subscription_amount:e.target.value})} placeholder="مثال: 500" className="mt-1 w-full rounded-xl bg-white/10 p-3"/></label>
            <label className="text-sm">حالة الدفع<select value={license.payment_status||'unpaid'} onChange={e=>setLicense({...license,payment_status:e.target.value})} className="mt-1 w-full rounded-xl bg-white/10 p-3"><option value="paid">مدفوع</option><option value="unpaid">غير مدفوع</option><option value="pending">قيد التحصيل</option><option value="overdue">متأخر</option><option value="waived">معفى</option></select></label>
            <label className="text-sm">تاريخ الدفع<input type="date" value={license.payment_date?license.payment_date.slice(0,10):''} onChange={e=>setLicense({...license,payment_date:e.target.value})} className="mt-1 w-full rounded-xl bg-white/10 p-3"/></label>
            <label className="text-sm">طريقة الدفع<select value={license.payment_method||''} onChange={e=>setLicense({...license,payment_method:e.target.value})} className="mt-1 w-full rounded-xl bg-white/10 p-3"><option value="">غير محددة</option><option value="cash">نقدي</option><option value="vodafone_cash">Vodafone Cash</option><option value="instapay">InstaPay</option><option value="bank_transfer">تحويل بنكي</option><option value="card">بطاقة</option><option value="other">أخرى</option></select></label>
            <input value={license.payment_reference||''} onChange={e=>setLicense({...license,payment_reference:e.target.value})} placeholder="مرجع / رقم العملية" className="rounded-xl bg-white/10 p-3"/>
            <textarea value={license.notes||''} onChange={e=>setLicense({...license,notes:e.target.value})} placeholder="ملاحظات الاشتراك أو الدفع" className="md:col-span-2 rounded-xl bg-white/10 p-3 min-h-24"/>
          </div>
          <div className="mt-3 text-xs text-white/40">البيانات المالية مرتبطة مباشرة بسجل الترخيص الحالي، ولا يوجد جدول إضافي مطلوب لهذه المرحلة.</div>
          <div className="flex gap-2 mt-4"><button onClick={saveLicense} className="btn-gold rounded-xl px-6 py-3">حفظ</button>{license.id&&<button onClick={()=>setLicense(emptyLicense)} className="bg-white/10 rounded-xl px-6 py-3">إلغاء</button>}</div>
          {licenseError&&<p className="text-yellow-300 mt-4">{licenseError}</p>}
        </div>
        <div className="space-y-3">{licenses.map(l=><div key={l.id} className="glass rounded-2xl p-4 flex justify-between gap-3"><div><b>{l.customer_name||'بدون اسم'}</b><div className="text-white/50">{l.domain}</div><div className="text-xs text-white/40 mt-1">{statusMeta(l).label} — حتى {fmtDate(l.expires_at)}</div><div className="text-xs mt-2"><span className="text-white/40">الدفع:</span> <span className={paymentMeta[l.payment_status||'unpaid']?.cls||''}>{paymentMeta[l.payment_status||'unpaid']?.label||'غير مسجل'}</span> · {money(l.subscription_amount)}</div></div><div className="flex gap-2"><button onClick={()=>setLicense({...l,expires_at:l.expires_at?.slice(0,10)||''})} className="bg-white/10 rounded-lg px-3 py-2">تعديل</button><button onClick={()=>deleteLicense(l.id)} className="bg-red-500/15 text-red-300 rounded-lg px-3 py-2">حذف الترخيص</button></div></div>)}</div>
      </section>}
    </div>
  </main>;
}
