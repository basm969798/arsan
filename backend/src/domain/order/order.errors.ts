export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class IllegalStateTransitionError extends DomainError {
  constructor(from: string, toCommand: string) {
    super(`ILLEGAL TRANSITION: Cannot execute command '${toCommand}' from state '${from}'.`);
    this.name = 'IllegalStateTransitionError';
  }
}

export class TenantIsolationError extends DomainError {
  constructor() {
    super('TENANT ISOLATION VIOLATION: company_id is strictly required.');
    this.name = 'TenantIsolationError';
  }
}