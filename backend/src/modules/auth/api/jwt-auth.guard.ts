import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {

  handleRequest(err, user, info) {

    // إذا لا يوجد user أو حصل error
    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}