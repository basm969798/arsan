import * as bcrypt from 'bcrypt';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';

export class RegisterUserHandler {
  // هنا سنفترض وجود UserRepository يتم حقنه لاحقاً
  constructor(private readonly userRepository: any) {}

  async handle(command: RegisterUserCommand) {
    const { email, password } = command.data;

    // 1. التأكد من عدم وجود المستخدم (بند SaaS 2.1)
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    // 2. تشفير كلمة المرور (بند SaaS 2.3)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. الحفظ عبر المستودع (Repository)
    return await this.userRepository.save({
      email,
      password_hash: passwordHash,
      is_email_verified: false
    });
  }
}
