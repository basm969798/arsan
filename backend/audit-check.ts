import { Order } from './src/business/order/infrastructure/order.entity';

async function verifyInvariants() {
    console.log("🔍 بدء فحص قوانين الدستور (Invariants Audit)...");
    
    const testOrder = new Order();
    testOrder.status = 'ACCEPTED';
    
    try {
        testOrder.locked_price = 100;
        console.log("✅ الخطوة 1: تم تحديد السعر الأولي بنجاح.");
    } catch (e) {
        console.error("❌ خطأ غير متوقع في الخطوة 1");
    }

    try {
        console.log("⚠️ محاولة خرق القاعدة 5.2 (تغيير السعر المقفل)...");
        testOrder.locked_price = 150; 
        console.error("🚨 فشل النظام! تم تغيير السعر المقفل. الطبقة الأولى غير محمية!");
    } catch (e: any) {
        console.log("🛡️ نجاح! النظام منع التغيير وأطلق خطأ: " + e.message);
        console.log("✅ البند 5.2 محمي برمجياً.");
    }
}

verifyInvariants();
