import { IUser } from '../models/user.interface';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  save(user: Partial<IUser>): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<void>;
}
