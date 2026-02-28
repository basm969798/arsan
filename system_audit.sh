#!/bin/bash

# الألوان للتنسيق
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 بدء فحص نزاهة النظام المطور (System Integrity Audit v2.0)...${NC}"
echo "-------------------------------------------------------"

# 1. فحص نظافة جذر المشروع
echo -e "${YELLOW}📁 1. فحص الهيكل التنظيمي:${NC}"
JS_FILES=$(ls backend/*.js 2>/dev/null)
if [ -z "$JS_FILES" ]; then
    echo -e "${GREEN}✅ نجاح: الجذر نظيف من ملفات السكريبت عشوائية.${NC}"
else
    echo -e "${RED}⚠️ تحذير: لا تزال هناك ملفات .js في الجذر!${NC}"
    echo "$JS_FILES"
fi

# 2. فحص الكيانات (Invariants 2.1 & 9)
echo -e "\n${YELLOW}🛡️ 2. فحص الكيانات (Entity Inheritance):${NC}"
# نبحث عن الكيانات التي لا ترث من BaseEntity
ENTITIES_FAIL=$(find backend/src -name "*.entity.ts" | xargs grep -L "extends BaseEntity" | grep -v "base.entity.ts")
if [ -z "$ENTITIES_FAIL" ]; then
    echo -e "${GREEN}✅ نجاح: جميع الكيانات ترث من BaseEntity وتطبق عزل الشركات.${NC}"
else
    echo -e "${RED}❌ نقص: هذه الكيانات لا تتبع الدستور:${NC}"
    echo "$ENTITIES_FAIL"
fi

# 3. فحص المستودعات (Invariants 2.1 & 5.1)
echo -e "\n${YELLOW}🏗️ 3. فحص المستودعات (Repository Protection):${NC}"
REPOS_FAIL=$(find backend/src -name "*repository.ts" | xargs grep -L "extends BaseRepository" | grep -v "base.repository.ts")
if [ -z "$REPOS_FAIL" ]; then
    echo -e "${GREEN}✅ نجاح: جميع المستودعات محمية عبر BaseRepository.${NC}"
else
    echo -e "${RED}❌ نقص: هذه المستودعات تعمل خارج نطاق الحماية:${NC}"
    echo "$REPOS_FAIL"
fi

# 4. فحص حظر الحذف الصارم (Invariants 4.1 & 5.1)
echo -e "\n${YELLOW}🚫 4. فحص حظر الحذف (Hard Delete Check):${NC}"
# نبحث عن استخدام .delete() خارج الملف الأساسي
DELETE_USAGE=$(grep -r "\.delete(" backend/src/business/ | grep -v "BaseRepository")
if [ -z "$DELETE_USAGE" ]; then
    echo -e "${GREEN}✅ نجاح: لم يتم العثور على عمليات حذف محرمة في موديولات الأعمال.${NC}"
else
    echo -e "${RED}🚨 خطر: تم العثور على أوامر حذف مباشرة في:${NC}"
    echo "$DELETE_USAGE"
fi

# 5. فحص قفل السعر (Invariants 5.2)
echo -e "\n${YELLOW}💰 5. فحص قفل السعر (Price Locking):${NC}"
if grep -q "set locked_price" backend/src/business/order/infrastructure/order.entity.ts; then
    echo -e "${GREEN}✅ نجاح: حارس السعر (Setter Guard) موجود في Order Entity.${NC}"
else
    echo -e "${RED}❌ خطأ: حارس السعر مفقود أو لم يتم تسميته بشكل صحيح!${NC}"
fi

echo "-------------------------------------------------------"
echo -e "${YELLOW}🏁 انتهى الفحص.${NC}"
