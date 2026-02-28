const API_URL = 'http://localhost:8080';
const uniqueEmail = `owner_${Math.floor(Math.random() * 1000)}@arson.com`;
const pass = 'Arson@2026';

async function test() {
  console.log('--- 🧪 بدء فحص الدخول الشامل ---');
  
  // 1. تسجيل مستخدم جديد كلياً
  console.log(`1. محاولة تسجيل: ${uniqueEmail}`);
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName: 'شركة أرصن للتجارب', email: uniqueEmail, password: pass })
  });
  
  if (regRes.ok) {
    console.log('✅ تم التسجيل بنجاح في قاعدة البيانات.');
  } else {
    console.log('❌ فشل التسجيل. كود الخطأ:', regRes.status);
  }

  // 2. محاولة تسجيل الدخول فوراً بنفس البيانات
  console.log('2. محاولة تسجيل الدخول الآن...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: pass })
  });

  const data = await loginRes.json();
  if (loginRes.ok) {
    console.log('✅ نجحت العملية! التوكن مستلم.');
    console.log('\n--- 🔑 استخدم هذه البيانات للدخول الآن ---');
    console.log(`البريد: ${uniqueEmail}`);
    console.log(`الباسورد: ${pass}`);
  } else {
    console.log('❌ السيرفر رفض الدخول! الرسالة:', data.message);
    console.log('💡 نصيحة المعماري: افحص شاشة الـ NestJS Logs، ابحث عن خطأ "UnauthorizedException"');
  }
}
test();
