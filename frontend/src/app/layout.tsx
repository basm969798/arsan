'use client';
import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { initSocket } from '@/lib/socket-service';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');

    if (!token || !userInfo) {
      if (!isLoginPage) router.push('/login');
    } else {
      const { companyId } = JSON.parse(userInfo);
      initSocket(companyId);
    }
  }, [pathname, isLoginPage, router]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8f9fa', overflowX: 'hidden' }}>
        <Toaster />
        {isClient && !isLoginPage && <Sidebar />}
        <main style={{ marginRight: (isClient && !isLoginPage) ? '260px' : 0, minHeight: '100vh', transition: 'margin 0.3s ease' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
