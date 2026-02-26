'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Package, ChevronLeft, AlertCircle, ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/orders');
      setOrders(data);
    } catch (err: any) {
      setError('فشل في جلب الطلبات. يرجى التأكد من الاتصال بالخادم.');
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW': return { color: '#007bff', bg: '#e7f1ff', text: 'جديد' };
      case 'WAITING_FOR_SUPPLIER': return { color: '#6f42c1', bg: '#f3e8ff', text: 'بانتظار المورد' };
      case 'ACCEPTED': return { color: '#20c997', bg: '#e6fcf5', text: 'تم القبول' };
      case 'PREPARING': return { color: '#fd7e14', bg: '#fff5eb', text: 'جاري التجهيز' };
      case 'READY_FOR_PICKUP': return { color: '#ffc107', bg: '#fff3cd', text: 'جاهز للاستلام' };
      case 'COMPLETED': return { color: '#28a745', bg: '#e6f4ea', text: 'مكتمل' };
      case 'REJECTED': return { color: '#dc3545', bg: '#f8d7da', text: 'مرفوض' };
      case 'CANCELLED': return { color: '#6c757d', bg: '#f8f9fa', text: 'ملغي' };
      default: return { color: '#6c757d', bg: '#f8f9fa', text: status };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333' }}>إدارة الطلبات</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}
        >
          {loading ? 'جاري التحديث...' : 'تحديث القائمة'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && !error ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>جاري تحميل الطلبات...</p>
      ) : orders.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '15px', border: '1px dashed #ccc' }}>
          <ShoppingCart size={64} style={{ color: '#eee', marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#555', marginBottom: '0.5rem' }}>لا توجد طلبات حالية</h3>
          <p style={{ color: '#999' }}>ابدأ بالبحث في الكتالوج واطلب قطع الغيار لشركتك!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order: any) => {
            const status = getStatusStyle(order.status);
            const itemsCount = order.items ? order.items.length : 0;

            return (
              <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                    <Package size={28} color="#555" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#222' }}>طلب #{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.9rem', color: '#777', marginTop: '4px', display: 'flex', gap: '15px' }}>
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span>{itemsCount} قطع</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', color: status.color, backgroundColor: status.bg, border: `1px solid ${status.color}33` }}>
                    {status.text}
                  </span>
                  <ChevronLeft size={24} color="#ccc" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
