'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');

    if (!token || !userInfo) {
      return router.push('/login');
    }

    setUser(JSON.parse(userInfo));
  }, [router]);

  if (!user) return <p style={{ padding: '2rem', textAlign: 'center' }}>جاري التحقق...</p>;

  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>مرحبا بك في أرسان</h1>
      <p>معرف شركتك الموثق (Tenant ID): <br/><strong>{user.companyId}</strong></p>
      <p>حسابك: <strong>{user.email}</strong></p>
      <button onClick={() => { localStorage.clear(); router.push('/login'); }} style={{ marginTop: '2rem', padding: '10px 20px', color: '#fff', backgroundColor: '#dc3545', cursor: 'pointer', border: 'none', borderRadius: '6px' }}>
        تسجيل الخروج
      </button>
    </div>
  );
}
