'use client';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify({
        userId: data.userId,
        companyId: data.companyId,
        email: email
      }));

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', direction: 'rtl', backgroundColor: '#f8f9fa' }}>
      <form onSubmit={handleLogin} style={{ padding: '2.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', width: '380px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>دخول أرسان</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '2rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}
