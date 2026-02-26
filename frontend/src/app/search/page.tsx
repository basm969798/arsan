'use client';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Search as SearchIcon, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setHasSearched(true);
    try {
      const { data } = await apiClient.get(`/search/parts?query=${query}`);
      setResults(data);
    } catch (err: any) {
      setError('فشل البحث. تأكد من اتصالك بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async (part: any) => {
    setOrderLoading(part.id);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/orders', {
        items: [{ partId: part.id, quantity: 1 }],
        notes: `طلب تسعير لقطعة: ${part.name}`
      });

      setSuccess(`تم إنشاء طلب التسعير للقطعة ${part.name} بنجاح!`);
      setTimeout(() => router.push('/orders'), 2000);
    } catch (err: any) {
      setError('فشل إنشاء الطلب. حاول مرة أخرى.');
    } finally {
      setOrderLoading(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>البحث والطلب</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="ابحث برقم القطعة (OEM) أو الاسم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0 25px', background: '#000', color: '#fff', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
          {loading ? '...' : <SearchIcon size={20} />}
        </button>
      </form>

      {success && (
        <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {results.map((part: any) => (
          <div key={part.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#007bff', marginBottom: '10px' }}>
              <Package size={20} />
              <span style={{ fontWeight: 'bold' }}>{part.name}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>OEM: {part.oemNumber}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{part.basePrice || '---'} ر.س</span>
              <button
                onClick={() => handleRequestQuote(part)}
                disabled={orderLoading === part.id}
                style={{ padding: '10px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {orderLoading === part.id ? 'جاري الطلب...' : 'طلب تسعير'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && hasSearched && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: '#fff', borderRadius: '12px', border: '1px dashed #ddd' }}>
          <SearchIcon size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h3>لم نجد أي قطع مطابقة</h3>
          <p>تأكد من رقم الـ OEM أو جرب كلمات بحث مختلفة.</p>
        </div>
      )}
    </div>
  );
}
