import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  sub: number;
  email: string;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return request.user;
  },
);