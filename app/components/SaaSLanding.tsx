'use client';

import Link from 'next/link';

const demos = [
  ['موقع رأس البر','https://rasalbar.egarat.online'],
  ['نسخة النظام الأساسية','https://sakan-egy.vercel.app'],
  ['مثال عقاري','https://akar-egy.vercel.app']
];

function Screen({src,alt}:{src:string;alt:string}){
  return <div className="lux-screen"><div className="lux-browserbar"><i/><i/><i/><span>egarat.online</span></div><img src={src} alt={alt} loading="lazy"/></div>;
}

function Dashboard(){
  return <div className="lux-dashboard">
    <div className="lux-dashboard-top"><b>لوحة تحكم المكتب</b><span>● متصل</span></div>
    <div className="lux-dashboard-body">
      <aside><strong>س</strong><small>الرئيسية</small><small>العقارات</small><small>الحجوزات</small><small>التقويم</small><small>المدفوعات</small></aside>
      <section>
        <div className="lux-dash-head"><div><small>أهلاً بك</small><h3>مكتبك العقاري</h3></div><button>+ إضافة عقار</button></div>
        <div className="lux-stats"><div><small>الحجوزات</small><b>12</b></div><div><small>العقارات</small><b>28</b></div><div><small>الإيرادات</small><b>8,450</b></div></div>
        <div className="lux-orders"><b>آخر الحجوزات</b><p><span>م</span><label>محمد أحمد<small>شاليه الساحل · 12 أكتوبر</small></label><em>قيد الانتظار</em></p><p><span>س</span><label>سارة محمود<small>شقة المعادي · 18 أكتوبر</small></label><em>مؤكد</em></p><p><span>أ</span><label>أحمد علي<small>فيلا أكتوبر · 21 أكتوبر</small></label><em>عربون مدفوع</em></p></div>
      </section>
    </div>
  </div>;
}

export default function SaaSLanding(){
  return <main className="saas-luxury" dir="rtl">
    <header className="lux-nav"><div className="lux-container lux-nav-inner">
      <Link href="/" className="lux-brand"><span className="lux-mark">س</span><span><b>سكن</b><small>Rental SaaS</small></span></Link>
      <nav><a href="#product">المنصة</a><a href="#proof">النظام الحقيقي</a><a href="#how">كيف يعمل</a><a href="#pricing">الاشتراك</a></nav>
      <a className="lux-nav-cta" href="https://wa.me/201026569682?text=%D8%A7%D8%A8%D8%B9%D8%AA%20%D8%B3%D9%83%D9%86">اطلب موقعك</a>
    </div></header>

    <section className="lux-hero"><div className="lux-container lux-hero-grid">
      <div className="lux-hero-copy"><span className="lux-kicker">منصة تأجير عقاري مصرية</span><h1>حوّل مكتبك العقاري<br/><em>إلى منصة حجز.</em></h1><p>موقع احترافي باسمك، يستعرض عقاراتك ويستقبل الحجوزات ويدير التوافر والعربون من لوحة تحكم واحدة.</p><div className="lux-actions"><a className="lux-btn lux-gold" href="https://wa.me/201026569682?text=%D8%A7%D8%A8%D8%B9%D8%AA%20%D8%B3%D9%83%D9%86">اطلب موقعك للتجربة</a><a className="lux-btn lux-ghost" href="#proof">شاهد النظام الحقيقي ↓</a></div><div className="lux-trust"><span>بدون تكلفة إنشاء</span><i/><span>تجربة قبل الدفع</span><i/><span>رابط باسمك</span></div></div>
      <div className="lux-hero-media"><div className="lux-hero-photo"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1500&q=86" alt="عقار فاخر لموقع تأجير"/></div><div className="lux-float"><b>حجز جديد</b><small>تم استلام العربون</small><strong>✓</strong></div></div>
    </div></section>

    <section className="lux-band"><div className="lux-container"><span>موقع العميل</span><span>العقارات</span><span>الحجوزات</span><span>التوافر</span><span>المدفوعات</span><b>كلها في نظام واحد.</b></div></section>

    <section id="product" className="lux-section"><div className="lux-container"><div className="lux-intro"><div><span className="lux-kicker">ليس مجرد موقع</span><h2>أنت لا تشتري صفحة.<br/><em>أنت تحصل على نظام.</em></h2></div><p>العميل يدخل رابطك، يرى العقار، يعرف السعر والتوافر، يرسل الحجز ويختار طريقة الدفع. أنت ترى كل ذلك داخل لوحة إدارة مخصصة لمكتبك.</p></div><div className="lux-features">
      <article><span>01</span><h3>موقع باسمك</h3><p>اسم المكتب والهوية والصور والعقارات في واجهة احترافية ورابط خاص.</p></article><article><span>02</span><h3>حجوزات منظمة</h3><p>تأكيد ورفض وعربون ومواعيد الوصول والتسليم بدون فوضى الرسائل.</p></article><article><span>03</span><h3>توافر مباشر</h3><p>التقويم يعرض المتاح والمحجوز ويقلل تضارب الحجوزات.</p></article><article><span>04</span><h3>لوحة إدارة</h3><p>أضف العقارات والأسعار والصور وتابع النشاط من مكان واحد.</p></article>
    </div></div></section>

    <section id="proof" className="lux-section lux-proof"><div className="lux-container"><div className="lux-head"><span className="lux-kicker">Proof of Product</span><h2>شوف المنتج الحقيقي،<br/><em>مش Mockup.</em></h2><p>صور العقارات حقيقية، والنظام الذي نعرضه هو نفس تجربة العميل والإدارة التي يعمل بها المشروع.</p></div>
      <div className="lux-showcase"><Screen src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=86" alt="واجهة موقع عقاري حقيقية"/><div><span>01 — واجهة العميل</span><h3>موقع عقاري يحمل اسم مكتبك.</h3><p>اعرض الشقق والشاليهات والفيلات بصور حقيقية، تفاصيل واضحة، أسعار وتوافر وزر حجز مباشر.</p><a href="https://rasalbar.egarat.online" target="_blank" rel="noreferrer">افتح مثالاً حقيقياً ↗</a></div></div>
      <div className="lux-proof-grid"><article><Screen src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=86" alt="صور عقار حقيقية"/><b>واجهة العقارات</b><p>صور كبيرة وتفاصيل واضحة تجعل العميل يصل للحجز بسرعة.</p></article><article><Dashboard/><b>لوحة الإدارة</b><p>الحجوزات والعقارات والمدفوعات في شاشة تشغيل واحدة.</p></article><article><div className="lux-booking-card"><small>حجز جديد</small><strong>محمد أحمد</strong><span>02 أكتوبر → 06 أكتوبر</span><em>5000 ج.م · عربون</em><button>تأكيد الحجز</button></div><b>إدارة الحجز</b><p>راجع العميل والمواعيد والمبلغ المدفوع واتخذ الإجراء مباشرة.</p></article></div>
    </div></section>

    <section id="how" className="lux-section lux-how"><div className="lux-container"><div className="lux-head center"><span className="lux-kicker">بداية بسيطة</span><h2>من الفكرة إلى أول حجز<br/><em>في 3 خطوات.</em></h2></div><div className="lux-steps"><div><strong>01</strong><h3>ابعت «سكن»</h3><p>نتعرف على مكتبك ونجهز بيانات الموقع والهوية والعقارات.</p></div><div><strong>02</strong><h3>جرّب موقعك</h3><p>تشاهد النسخة باسمك وتجرب الحجز ولوحة التحكم قبل الدفع.</p></div><div><strong>03</strong><h3>ابدأ استقبال الحجوزات</h3><p>رابطك يصبح جاهزاً وتبدأ إدارة العملاء والحجوزات من نفس اليوم.</p></div></div></div></section>

    <section className="lux-section lux-dark"><div className="lux-container lux-dark-grid"><div><span className="lux-kicker">Back Office</span><h2>لوحة واحدة.<br/><em>سيطرة كاملة.</em></h2><p>بدلاً من متابعة كل حجز في واتساب ودفتر ومكالمات، اجمع التشغيل اليومي لمكتبك في واجهة واحدة.</p><ul><li>إدارة العقارات والصور والأسعار</li><li>متابعة الحجوزات وحالاتها</li><li>تسجيل العربون وطرق الدفع</li><li>تقويم للتوافر والحجوزات</li></ul></div><Dashboard/></div></section>

    <section id="pricing" className="lux-section lux-price"><div className="lux-container lux-price-grid"><div><span className="lux-kicker">اشتراك واضح</span><h2>300 <small>ج.م</small><br/><em>شهرياً.</em></h2><p>موقعك + لوحة التحكم + إدارة العقارات والحجوزات في اشتراك واحد.</p><span className="lux-note">10 جنيه تقريباً في اليوم</span></div><div className="lux-price-card"><span>باقة سكن</span><strong>300 <small>ج.م / شهر</small></strong><ul><li>✓ موقع باسم مكتبك</li><li>✓ رابط خاص</li><li>✓ لوحة تحكم خاصة</li><li>✓ إدارة العقارات والحجوزات</li><li>✓ وسائل دفع للعربون</li><li>✓ تقويم التوافر</li></ul><a className="lux-btn lux-gold" href="https://wa.me/201026569682?text=%D8%A7%D8%A8%D8%B9%D8%AA%20%D8%B3%D9%83%D9%86">ابدأ بتجربة موقعك</a><small>جرّب النظام أولاً، ثم قرر.</small></div></div></section>

    <section className="lux-section lux-demos"><div className="lux-container"><div className="lux-head center"><span className="lux-kicker">Live Demos</span><h2>جرب التجربة بنفسك.</h2><p>مواقع فعلية تعمل بالنظام ويمكنك فتحها الآن.</p></div><div className="lux-demo-grid">{demos.map(d=><a key={d[1]} href={d[1]} target="_blank" rel="noreferrer"><span>LIVE ↗</span><small>تجربة حية</small><h3>{d[0]}</h3><b>فتح الموقع</b></a>)}</div></div></section>

    <section className="lux-final"><div className="lux-container"><div><span>جاهز تبدأ؟</span><h2>خلّي مكتبك يبيع<br/><em>بدل ما يرد على الرسائل.</em></h2><p>اطلب موقعك باسم مكتبك وجرب النظام قبل الدفع.</p><a className="lux-btn lux-gold" href="https://wa.me/201026569682?text=%D8%A7%D8%A8%D8%B9%D8%AA%20%D8%B3%D9%83%D9%86">تواصل معنا على واتساب</a></div></div></section>

    <footer className="lux-footer"><div className="lux-container"><div className="lux-footer-main"><div className="lux-brand"><span className="lux-mark">س</span><span><b>سكن</b><small>Rental SaaS</small></span></div><p>منصة SaaS مصرية متخصصة في التأجير والحجز العقاري.</p><div><a href="#product">المنصة</a><a href="#proof">النظام الحقيقي</a><a href="#pricing">الاشتراك</a><a href="https://wa.me/201026569682?text=%D8%A7%D8%A8%D8%B9%D8%AA%20%D8%B3%D9%83%D9%86">واتساب</a></div></div><div className="lux-footer-bottom">© 2026 سكن — egarat.online</div></div></footer>
  </main>;
}