// 🛡️ لا تستورد من infrastructure هنا!
// استخدم interface بسيطة لوصف النتيجة
export interface ISubscriptionResult {
  id: string;
  companyId: string;
  status: string;
}

export interface ISubscriptionRepository {
  createTrial(
    companyId: string, 
    planId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ISubscriptionResult>; 
}