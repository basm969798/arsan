// backend/src/shared/errors/tenant-access-denied.error.ts

import { DomainError } from './domain.error';

export class TenantAccessDeniedError extends DomainError {
  constructor(tenantId: string) {
    // 1. Pass only message to super (Error class)
    super(`Access denied for tenant: ${tenantId}`);

    // 2. Set error name explicitly
    this.name = 'TenantAccessDeniedError';
  }
}