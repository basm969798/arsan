import { DomainError } from './domain.error';

export class TenantAccessDeniedError extends DomainError {
  constructor(tenantId: string) {
    super(`Access denied for tenant: ${tenantId}`, 'TENANT_ACCESS_DENIED');
  }
}
