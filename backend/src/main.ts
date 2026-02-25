import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // تفعيل الفلتر العالمي لاصطياد الأخطاء
  app.useGlobalFilters(new GlobalExceptionFilter());

  // تفعيل CORS للسماح للواجهة الأمامية بالاتصال لاحقاً
  app.enableCors();

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();