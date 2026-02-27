'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify({
        email: data.email,
        companyId: data.companyId,
        companyName: data.companyName
      }));
      toast.success('مرحباً بك في أرصن');
      router.push('/');
    } catch (err: any) {
      toast.error('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck size={40} color="#3b82f6" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px', letterSpacing: '-1px' }}>أرصن</h1>
        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>منصة إمداد قطع الغيار الذكية</p>

        <form onSubmit={handleLogin} style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: '#94a3b8' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: '#94a3b8' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
