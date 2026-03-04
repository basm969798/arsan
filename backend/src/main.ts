import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { NestInterceptor, Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ✅ تعريف محول توقيت بغداد مباشرة هنا (لسهولة التنفيذ والدمج)
@Injectable()
export class BaghdadTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => this.transformDates(data)));
  }

  private transformDates(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(item => this.transformDates(item));
    if (data instanceof Date) return this.formatDate(data);

    if (typeof data === 'object') {
      const newData = {};
      for (const key in data) {
        if (data[key] instanceof Date) {
          newData[key] = this.formatDate(data[key]);
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          newData[key] = this.transformDates(data[key]);
        } else {
          newData[key] = data[key];
        }
      }
      return newData;
    }
    return data;
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', { 
      timeZone: 'Asia/Baghdad', 
      hour12: true,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. التحقق من المدخلات وحذف أي بيانات زائدة
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. تفعيل تحويل جميع التواريخ الصادرة إلى توقيت بغداد
  app.useGlobalInterceptors(new BaghdadTimeInterceptor());

  // 3. معالجة الأخطاء بشكل موحد
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 4. تفعيل CORS للسماح للموبايل والويب بالاتصال
  app.enableCors({ origin: true, credentials: true });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Arsan API Secured & Running on port ${port} (Baghdad Time Enabled)`);
}
bootstrap();