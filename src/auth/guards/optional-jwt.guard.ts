import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (authHeader) {
      try {
        let token: string;
        
        if (authHeader.startsWith('Token ')) {
          token = authHeader.substring(6);
        } else {
          return true;
        }

        const jwtSecret = this.configService.get('JWT_SECRET');
        const decoded = this.jwtService.verify(token, { secret: jwtSecret });
        request.user = decoded;
      } catch (error) {
        
      }
    }
    
    return true;
  }
}
