import { IUser } from '../models/user.interface';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  saveUser(user: Partial<IUser>): Promise<IUser>;

  /**
   * 🛡️ استخدمنا patch بدلاً من update لتجنب التعارض مع 
   * دالة update الأصلية في TypeORM/BaseRepository
   */
  patch(id: string, user: Partial<IUser>): Promise<void>;
}
