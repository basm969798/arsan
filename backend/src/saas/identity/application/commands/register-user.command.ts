import { RegisterDto } from '../dtos/register.dto';

export class RegisterUserCommand {
  constructor(public readonly data: RegisterDto) {}
}
