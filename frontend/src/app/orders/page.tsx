'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Package, ChevronLeft, AlertCircle, ShoppingCart, Banknote } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await apiClient.get('/orders');
      setOrders(data);
    } catch (err: any) {
      setError('فشل في جلب الطلبات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCloseOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من سداد هذا الطلب نقدا وإغلاقه؟')) return;
    try {
      await apiClient.post('/finance/close-order', {
        orderId,
        type: 'CASH',
        amount: 0,
        note: 'سداد نقدي عبر المنصة'
      });
      alert('تم السداد وإغلاق الطلب بنجاح!');
      fetchOrders();
    } catch (err) {
      alert('حدث خطأ أثناء الإغلاق المالي.');
    }
  };

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
        <button onClick={fetchOrders} disabled={loading} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'تحديث...' : 'تحديث القائمة'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

      {loading && !error ? (
        <p style={{ textAlign: 'center', color: '#666' }}>جاري تحميل الطلبات...</p>
      ) : orders.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '15px', border: '1px dashed #ccc' }}>
          <ShoppingCart size={64} style={{ color: '#eee', marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#555' }}>لا توجد طلبات حالية</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order: any) => {
            const status = getStatusStyle(order.status);
            const itemsCount = order.items ? order.items.length : 0;

            return (
              <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                    <Package size={28} color="#555" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>طلب #{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.9rem', color: '#777', marginTop: '4px', display: 'flex', gap: '15px' }}>
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span>{itemsCount} قطع</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', color: status.color, backgroundColor: status.bg }}>
                    {status.text}
                  </span>

                  {order.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCloseOrder(order.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Banknote size={16} /> سداد
                    </button>
                  )}

                  <ChevronLeft size={24} color="#ccc" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
