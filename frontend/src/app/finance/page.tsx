'use client';
import { useEffect, useState } from 'react';
import { Landmark, AlertTriangle, History, TrendingDown } from 'lucide-react';

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) setCompanyId(JSON.parse(userInfo).companyId);
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#333' }}>المركز المالي</h1>
        {companyId && (
          <span style={{ fontSize: '0.85rem', color: '#666', background: '#eee', padding: '5px 10px', borderRadius: '6px' }}>
            معرف الشركة: {companyId.split('-')[0]}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>جاري تحميل البيانات...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '2rem 0' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', border: '1px solid #eee', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <AlertTriangle size={36} color="#dc3545" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: 0, color: '#666' }}>إجمالي الديون المعلقة</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545', marginTop: '10px' }}>0.00 <span style={{fontSize:'1.2rem'}}>ر.س</span></div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #28a745, #1e7e34)', padding: '2rem', borderRadius: '15px', color: '#fff', textAlign: 'center', boxShadow: '0 6px 15px rgba(40,167,69,0.2)' }}>
              <TrendingDown size={36} style={{ marginBottom: '15px', opacity: 0.9 }} />
              <h3 style={{ margin: 0, opacity: 0.9 }}>إجمالي المدفوعات</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>0.00 <span style={{fontSize:'1.2rem'}}>ر.س</span></div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', border: '1px solid #eee' }}>
            <h3 style={{ margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={24} color="#007bff" /> سجل العمليات المالية
            </h3>
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '10px', border: '1px dashed #ccc' }}>
              <Landmark size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#777', margin: 0 }}>لا توجد عمليات مالية مسجلة حاليا.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
