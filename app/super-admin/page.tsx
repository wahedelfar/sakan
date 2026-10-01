'use client';
import { useEffect, useState } from 'react';

type License = { id:string; customer_name?:string; customer_phone?:string; domain?:string; status:string; expires_at?:string|null; created_at?:string };
const emptyLicense = { customer_name:'', customer_phone:'', domain:'', status:'active', expires_at:'' };

export default function SuperAdmin() {
  const [ready,setReady]=useState(false);
  const [tab,setTab]=useState('brand');
  const [licenses,setLicenses]=useState<License[]>([]);
  const [customers,setCustomers]=useState<any[]>([]);
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
    setCustomers(j.customers||[]);
    if(j.settings?.length && !settings.tenant_domain) setSettings(j.settings[0]);
  };

  useEffect(()=>{
    (async()=>{
      const r=await fetch('/api/super-admin/data',{cache:'no-store'});
      if(r.status===401){location.href='/super-admin/login';return;}
      const j=await r.json().catch(()=>({}));
      if(!r.ok){setLicenseError(j.error||'تعذر تحميل بيانات الإدارة العليا');setReady(true);return;}
      setLicenses(j.licenses||[]);
      setAllSettings(j.settings||[]);
      setCustomers(j.customers||[]);
      if(j.settings?.length) setSettings(j.settings[0]);
      setReady(true);
    })();
  },[]);

  const saveLicense=async()=>{
    if(!license.customer_name && !license.domain)return alert('أدخل اسم العميل أو النطاق');
    const r=await fetch('/api/super-admin/action',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'license_save',id:license.id||null,data:{...license,expires_at:license.expires_at||null}})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر حفظ الترخيص');
    setLicense(emptyLicense);setNotice('✅ تم حفظ الترخيص');load();
  };

  const deleteLicense=async(id:string)=>{
    if(!confirm('حذف الترخيص؟'))return;
    const r=await fetch('/api/super-admin/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'license_delete',id})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر الحذف');
    load();
  };

  const saveBrand=async()=>{
    if(!settings.tenant_domain)return alert('اكتب الدومين - مثال: sakan-egy.vercel.app');
    const r=await fetch('/api/super-admin/action',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'settings_save',data:settings})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'تعذر حفظ الإعدادات');
    setNotice('✅ تم حفظ إعدادات '+settings.tenant_domain);
    load();
  };

  const logout=async()=>{
    await fetch('/api/super-admin/logout',{method:'POST'});
    localStorage.removeItem('isSuperAdmin');
    location.href='/';
  };

  if(!ready)return <main className="min-h-screen grid place-items-center">جاري التحقق...</main>;

  return <main className="min-h-screen p-5">
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div><h1 className="gold text-3xl font-extrabold">سكن Super Admin</h1><div className="text-white/40">انت بس اللي تتحكم - كل عميل بدومينه</div></div>
        <button onClick={logout} className="bg-white/10 rounded-xl px-4 py-2">خروج</button>
      </header>

      <nav className="glass rounded-2xl p-2 grid grid-cols-3 gap-2 mb-6">
        {[['brand','إعدادات البراند والعملاء'],['licenses','التراخيص'],['customers','العملاء']].map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`w-full px-4 py-3 rounded-xl ${tab===k?'bg-[#D4AF37] text-black font-bold':'bg-white/5'}`}>{l}</button>)}
      </nav>

      {notice&&<div className="mb-4 glass rounded-xl p-3 border border-[#D4AF37]/30">{notice}<button onClick={()=>setNotice('')} className="float-left">×</button></div>}

      {tab==='brand'&&<section className="space-y-5">
        <div className="glass rounded-2xl p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">إضافة / تعديل عميل (انت بس)</h2>
          <label className="block text-sm mb-3"><span className="block mb-1 text-[#D4AF37] font-bold">الدومين * (أهم حاجة)</span><input value={settings.tenant_domain||''} onChange={e=>setSettings({...settings,tenant_domain:e.target.value.toLowerCase().trim()})} placeholder="sakan-egy.vercel.app او client.com" className="w-full rounded-xl bg-white/10 p-3 border border-[#D4AF37]/30"/></label>
          {[['brand_name','اسم البراند'],['whatsapp_number','واتساب'],['vodafone_number','فودافون كاش'],['instapay_ipn','InstaPay IPN'],['logo_url','رابط الشعار']].map(([k,l])=><label key={k} className="block text-sm mb-3"><span className="block mb-1 text-white/70">{l}</span><input value={settings[k]||''} onChange={e=>setSettings({...settings,[k]:e.target.value})} className="w-full rounded-xl bg-white/10 p-3"/></label>)}
          <button onClick={saveBrand} className="btn-gold rounded-xl px-6 py-3 mt-2 w-full">حفظ إعدادات العميل ده ✅</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">{allSettings.map((r:any)=><div key={r.id} className="glass rounded-2xl p-4 flex justify-between gap-3"><div><b className="gold">{r.brand_name}</b><div className="text-white/50 text-sm">{r.tenant_domain}</div><div className="text-xs mt-1">{r.whatsapp_number} | {r.vodafone_number}</div></div><button onClick={()=>setSettings(r)} className="bg-white/10 rounded-lg px-4 py-2 h-fit">تعديل</button></div>)}</div>
      </section>}

      {tab==='licenses'&&<section>
        <div className="glass rounded-2xl p-5 mb-5">
          <h2 className="text-xl font-bold mb-4">{license.id?'تعديل ترخيص':'إضافة ترخيص'}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={license.customer_name} onChange={e=>setLicense({...license,customer_name:e.target.value})} placeholder="اسم العميل" className="rounded-xl bg-white/10 p-3"/>
            <input value={license.customer_phone} onChange={e=>setLicense({...license,customer_phone:e.target.value})} placeholder="هاتف العميل" className="rounded-xl bg-white/10 p-3"/>
            <input value={license.domain} onChange={e=>setLicense({...license,domain:e.target.value})} placeholder="النطاق" className="rounded-xl bg-white/10 p-3"/>
            <select value={license.status} onChange={e=>setLicense({...license,status:e.target.value})} className="rounded-xl bg-white/10 p-3"><option value="active">نشط</option><option value="suspended">موقوف</option><option value="expired">منتهي</option></select>
            <label className="text-sm">تاريخ الانتهاء<input type="date" value={license.expires_at||''} onChange={e=>setLicense({...license,expires_at:e.target.value})} className="mt-1 w-full rounded-xl bg-white/10 p-3"/></label>
          </div>
          <div className="flex gap-2 mt-4"><button onClick={saveLicense} className="btn-gold rounded-xl px-6 py-3">حفظ</button>{license.id&&<button onClick={()=>setLicense(emptyLicense)} className="bg-white/10 rounded-xl px-6 py-3">إلغاء</button>}</div>
          {licenseError&&<p className="text-yellow-300 mt-4">{licenseError}</p>}
        </div>
        <div className="space-y-3">{licenses.map(l=><div key={l.id} className="glass rounded-2xl p-4 flex justify-between gap-3"><div><b>{l.customer_name}</b><div className="text-white/50">{l.domain}</div></div><div className="flex gap-2"><button onClick={()=>setLicense({id:l.id,customer_name:l.customer_name||'',customer_phone:l.customer_phone||'',domain:l.domain||'',status:l.status||'active',expires_at:l.expires_at?.slice(0,10)||''})} className="bg-white/10 rounded-lg px-3 py-2">تعديل</button><button onClick={()=>deleteLicense(l.id)} className="bg-red-500/15 text-red-300 rounded-lg px-3 py-2">حذف</button></div></div>)}</div>
      </section>}

      {tab==='customers'&&<section className="space-y-3">{customers.map(c=><div key={c.id} className="glass rounded-2xl p-4"><div className="flex justify-between gap-3"><div><b>{c.name}</b><div className="text-white/50">{c.phone}</div></div><span className="text-xs text-white/40">عميل حجز</span></div><div className="text-xs text-white/40 mt-2">الموقع: {c.tenant_domain}</div></div>)}</section>
    </div>
  </main>;
}
