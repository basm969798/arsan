import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ICompanyRepository } from '../../saas/company/domain/repositories/company.repository.interface';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly companyRepository: any) {} // سنقوم بحقن الـ Repository هنا

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID (x-tenant-id) is required');
    }

    // التحقق من وجود الشركة وحالتها (البند 3.2 من الوثيقة)
    const company = await this.companyRepository.findById(tenantId);
    
    if (!company) {
      throw new NotFoundException('Company (Tenant) not found');
    }

    if (company.status === 'SUSPENDED' || company.status === 'EXPIRED') {
      throw new ForbiddenException(`Access denied. Company status is ${company.status}`);
    }

    // إلحاق بيانات الشركة بالطلب لاستخدامها في الطبقات اللاحقة
    request['tenant'] = company;

    return next.handle();
  }
}
