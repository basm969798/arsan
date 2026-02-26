'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { FolderPlus, PlusCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newPart, setNewPart] = useState({ categoryId: '', name: '', oemNumber: '', basePrice: '' });

  const fetchCatalog = async () => {
    try {
      const { data } = await apiClient.get('/catalog');
      setCatalog(data);
    } catch (err) { toast.error('فشل تحميل الكتالوج'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCatalog(); }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/catalog/categories', newCategory);
      toast.success('تمت إضافة القسم بنجاح');
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '' });
      fetchCatalog();
    } catch (err) { toast.error('فشل إضافة القسم'); }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        categoryId: newPart.categoryId,
        name: newPart.name,
        oemNumber: newPart.oemNumber
      };
      if (newPart.basePrice) payload.basePrice = Number(newPart.basePrice);

      await apiClient.post('/catalog/parts', payload);
      toast.success('تمت إضافة القطعة بنجاح');
      setShowAddPart(false);
      setNewPart({ categoryId: '', name: '', oemNumber: '', basePrice: '' });
      fetchCatalog();
    } catch (err) { toast.error('فشل إضافة القطعة'); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333' }}>إدارة الكتالوج</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddCategory(!showAddCategory)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}>
            <FolderPlus size={18} /> إضافة قسم
          </button>
          <button onClick={() => setShowAddPart(!showAddPart)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}>
            <PlusCircle size={18} /> إضافة قطعة
          </button>
        </div>
      </div>

      {showAddCategory && (
        <form onSubmit={handleAddCategory} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #333', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>إنشاء قسم جديد</h3>
          <input type="text" placeholder="اسم القسم (مثلا: المحركات)" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }} />
          <textarea placeholder="وصف القسم (اختياري)" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', minHeight: '80px' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ القسم</button>
        </form>
      )}

      {showAddPart && (
        <form onSubmit={handleAddPart} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #007bff', boxShadow: '0 4px 12px rgba(0,123,255,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>إضافة قطعة غيار جديدة</h3>
          <select value={newPart.categoryId} onChange={e => setNewPart({...newPart, categoryId: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}>
            <option value="">اختر القسم التابع له...</option>
            {catalog.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="text" placeholder="اسم القطعة (مثلا: فلتر زيت)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }} />
          <input type="text" placeholder="رقم المصنع (OEM Number)" value={newPart.oemNumber} onChange={e => setNewPart({...newPart, oemNumber: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }} />
          <input type="number" placeholder="السعر الأساسي (اختياري) ر.س" value={newPart.basePrice} onChange={e => setNewPart({...newPart, basePrice: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ القطعة في الكتالوج</button>
        </form>
      )}

      {loading ? <p style={{ textAlign: 'center', color: '#666' }}>جاري تحميل الكتالوج...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {catalog.map(cat => (
            <div key={cat.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #eee', transition: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontWeight: 'bold', fontSize: '1.2rem', borderBottom: '1px solid #f4f4f4', paddingBottom: '12px', marginBottom: '12px' }}>
                <Tag size={20} color="#007bff" /> {cat.name}
              </div>
              <div style={{ color: '#777', fontSize: '0.95rem', marginBottom: '10px' }}>{cat.description || 'لا يوجد وصف للقسم'}</div>
            </div>
          ))}
          {catalog.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px dashed #ccc' }}>
              <FolderPlus size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#777', margin: 0 }}>الكتالوج فارغ حاليا. ابدأ بإضافة الأقسام ليتمكن التجار من البحث عن قطعك.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
