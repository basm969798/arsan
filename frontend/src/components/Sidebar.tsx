'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Search, Package, Landmark, LogOut, Bell } from 'lucide-react';
import { disconnectSocket } from '@/lib/socket-service';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNewNotification = () => setUnreadCount(prev => prev + 1);
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);

  const menuItems = [
    { name: 'الرئيسية', icon: <LayoutDashboard size={20}/>, path: '/' },
    { name: 'البحث الذكي', icon: <Search size={20}/>, path: '/search' },
    { name: 'الطلبات', icon: <Package size={20}/>, path: '/orders' },
    { name: 'المالية', icon: <Landmark size={20}/>, path: '/finance' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    disconnectSocket();
    router.push('/login');
  };

  return (
    <div style={{ width: '260px', height: '100vh', background: '#fff', borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'fixed', right: 0, top: 0, zIndex: 1000 }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
        <h2 style={{ color: '#000', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>أرسان</h2>

        <div
          onClick={() => setUnreadCount(0)}
          style={{ position: 'absolute', left: '-5px', top: '5px', cursor: 'pointer', color: unreadCount > 0 ? '#ffc107' : '#ccc', transition: '0.3s' }}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc3545', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: pathname === item.path ? '#007bff' : '#555', backgroundColor: pathname === item.path ? '#f0f7ff' : 'transparent', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', transition: '0.3s' }}>
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', width: '100%', borderRadius: '8px', transition: '0.3s' }}>
        <LogOut size={20}/>
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
