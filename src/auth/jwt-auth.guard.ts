import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Overriding canActivate to add custom logic (password change check)
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValid = await super.canActivate(context);

    if (!isValid) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User doesn't contain this, it's just an example
    if (user?.emailNotVerified) {
      throw new ForbiddenException('You must verify your email address...');
    }

    return true;
  }
}
