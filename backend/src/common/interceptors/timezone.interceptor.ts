import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformDates(data))
    );
  }

  private transformDates(data: any): any {
    if (!data) return data;

    // إذا كانت البيانات مصفوفة
    if (Array.isArray(data)) {
      return data.map(item => this.transformDates(item));
    }

    // إذا كانت البيانات كائناً (Object)
    if (typeof data === 'object' && data !== null) {
      // إذا كان الكائن هو تاريخ (Date Object)
      if (data instanceof Date) {
        return data.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' });
      }

      // تكرار العملية لكل الحقول داخل الكائن
      const newData = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          // التحقق إذا كان الحقل هو تاريخ بصيغة نصية أو كائن
          const value = data[key];
          if (this.isDate(value)) {
            newData[key] = new Date(value).toLocaleString('en-GB', { 
              timeZone: 'Asia/Baghdad',
              hour12: true 
            });
          } else if (typeof value === 'object') {
            newData[key] = this.transformDates(value);
          } else {
            newData[key] = value;
          }
        }
      }
      return newData;
    }

    return data;
  }

  // دالة مساعدة لمعرفة هل القيمة تاريخ أم لا
  private isDate(value: any): boolean {
    if (value instanceof Date) return true;
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return !isNaN(Date.parse(value));
    }
    return false;
  }
}
