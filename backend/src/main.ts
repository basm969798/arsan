import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 0; // ← يخلي النظام يختار بورت فاضي

  const server = await app.listen(port, '0.0.0.0');

  const actualPort = server.address()['port'];

  console.log(`🚀 Server running on port ${actualPort}`);
}
bootstrap();
