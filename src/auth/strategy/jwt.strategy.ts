import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: JwtStrategy.extractJwtFromHeader,
      secretOrKey: jwtSecret,
    });
  }

  private static extractJwtFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    if (authHeader.startsWith('Token ')) {
      return authHeader.substring(6);
    }
    
    return null;
  }

  validate(payload: any) {
    return payload;
  }
}