import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';

export class LoginHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(email: string, pass: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) throw new InvalidCredentialsError();

    return { id: user.id, email: user.email };
  }
}
