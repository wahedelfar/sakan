'use client';
import { useState } from 'react';

export default function SuperAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    const r = await fetch('/api/super-admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) {
      setError('بيانات الدخول غير صحيحة');
      setLoading(false);
      return;
    }
    localStorage.setItem('isSuperAdmin', 'true');
    localStorage.removeItem('sakan_super');
    location.href = '/super-admin';
  };

  return (
    <main className="min-h-screen grid place-items-center p-5">
      <div className="glass rounded-3xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="gold text-3xl font-extrabold">سكن</div>
          <h1 className="text-2xl font-bold mt-2">دخول الإدارة العليا</h1>
        </div>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" className="mt-8 w-full rounded-xl bg-white/10 p-4" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" onKeyDown={e => e.key === 'Enter' && submit()} className="mt-3 w-full rounded-xl bg-white/10 p-4" />
        {error && <p className="text-red-300 mt-3">{error}</p>}
        <button disabled={loading} onClick={submit} className="btn-gold w-full rounded-xl p-4 mt-5 disabled:opacity-50">{loading ? 'جارٍ التحقق...' : 'دخول'}</button>
      </div>
    </main>
  );
}
