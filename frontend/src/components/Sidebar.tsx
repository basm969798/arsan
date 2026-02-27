'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Search, Package, Landmark, LogOut, Bell, FolderTree, ShieldCheck } from 'lucide-react';
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
    { name: 'إدارة الكتالوج', icon: <FolderTree size={20}/>, path: '/catalog' },
    { name: 'الطلبات', icon: <Package size={20}/>, path: '/orders' },
    { name: 'المالية', icon: <Landmark size={20}/>, path: '/finance' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    disconnectSocket();
    router.push('/login');
  };

  return (
    <div style={{ width: '260px', height: '100vh', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'fixed', right: 0, top: 0, zIndex: 1000, boxShadow: '-4px 0 15px rgba(0,0,0,0.02)' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <ShieldCheck size={28} color="var(--accent)" />
        <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>أرصن</h2>
        
        <div onClick={() => setUnreadCount(0)} style={{ position: 'absolute', left: '-5px', top: '5px', cursor: 'pointer', color: unreadCount > 0 ? '#ffc107' : '#cbd5e1', transition: '0.3s' }}>
          <Bell size={22} />
          {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{unreadCount}</span>}
        </div>
      </div>
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: isActive ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: isActive ? '#eff6ff' : 'transparent', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', transition: 'all 0.3s ease', fontWeight: isActive ? 'bold' : 'normal' }}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#ef4444', border: 'none', background: '#fef2f2', cursor: 'pointer', width: '100%', borderRadius: '8px', transition: '0.3s', fontWeight: 'bold' }}>
        <LogOut size={20}/>
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
