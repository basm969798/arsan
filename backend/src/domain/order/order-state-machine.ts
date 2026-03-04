import { OrderState } from './order.enums';

export class OrderStateMachine {
  private static readonly MATRIX: Record<OrderState, OrderState[]> = {
    [OrderState.DRAFT]: [OrderState.SUBMITTED, OrderState.CANCELLED],
    [OrderState.SUBMITTED]: [OrderState.OFFERED, OrderState.CANCELLED],
    [OrderState.OFFERED]: [OrderState.ACCEPTED, OrderState.CANCELLED, OrderState.REJECTED],
    [OrderState.ACCEPTED]: [OrderState.PREPARING, OrderState.CANCELLED], // الإلغاء مسموح هنا فقط قبل التجهيز
    [OrderState.PREPARING]: [OrderState.READY],

    // ✅ التحديث هنا: السماح بالانتقال إلى الاستلام (RECEIVED)
    [OrderState.READY]: [OrderState.RECEIVED, OrderState.COMPLETED], 

    // ✅ إضافة الحالة الجديدة: بعد الاستلام، الخطوة الوحيدة هي الإكمال
    [OrderState.RECEIVED]: [OrderState.COMPLETED],

    [OrderState.COMPLETED]: [],
    [OrderState.CANCELLED]: [],
    [OrderState.REJECTED]: []
  };

  static validateTransition(currentState: OrderState, newState: OrderState): { isValid: boolean; error?: string; event?: string } {
    const allowed = this.MATRIX[currentState];
    if (!allowed || !allowed.includes(newState)) {
      return { 
        isValid: false, 
        error: `Illegal state transition from ${currentState} to ${newState}` 
      };
    }

    // تحديد اسم الحدث بناءً على الحالة الجديدة
    let event = `ORDER_${newState}`; 
    if (newState === OrderState.OFFERED) event = 'OFFER_CREATED'; // أو حسب منطق العروض

    return { isValid: true, event };
  }
}