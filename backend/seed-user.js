const API_URL = 'http://localhost:8080';

async function seed() {
  console.log('⏳ جاري إنشاء حساب المدير لنظام أرصن...');
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'أرصن للإدارة المركزية',
        email: 'admin@arson.com',
        password: 'Arson@2026'
      })
    });
    
    if (res.ok || res.status === 409) {
      console.log('✅ الحساب جاهز الآن للاستخدام!');
      console.log('📧 الحساب: admin@arson.com');
      console.log('🔑 الباسورد: Arson@2026');
    } else {
      console.log('❌ حدث خطأ أثناء إنشاء الحساب.');
    }
  } catch (e) {
    console.log('❌ تأكد أن السيرفر يعمل على بورت 8080');
  }
}
seed();
