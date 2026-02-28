import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/db/user.entity';
import { AuthController } from './api/controllers/auth.controller';
import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { LoginHandler } from './application/handlers/login.handler';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';

@Module({
  imports: [
    // ربط الكيان بقاعدة البيانات في طبقة الـ Infrastructure
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [
    // ربط الواجهة بالتنفيذ (Inversion of Control)
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
    // توفير المعالجات لطبقة الـ API
    {
      provide: RegisterUserHandler,
      useFactory: (repo: TypeOrmUserRepository) => new RegisterUserHandler(repo),
      inject: ['IUserRepository'],
    },
    {
      provide: LoginHandler,
      useFactory: (repo: TypeOrmUserRepository) => new LoginHandler(repo),
      inject: ['IUserRepository'],
    },
  ],
  exports: [RegisterUserHandler, LoginHandler],
})
export class IdentityModule {}
