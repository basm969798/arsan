export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
}
