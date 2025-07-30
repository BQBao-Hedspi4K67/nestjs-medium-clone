import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalJwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      try {
        let token: string;
        
        // Support both "Bearer token" and "Token token" formats
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        } else if (authHeader.startsWith('Token ')) {
          token = authHeader.substring(6);
        } else {
          return next();
        }

        // Get JWT secret from environment
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.log('JWT_SECRET not found in environment');
          return next();
        }

        const decoded = jwt.verify(token, jwtSecret);
        (req as any).user = decoded;
        console.log('JWT middleware: User extracted from token:', decoded);
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Invalid JWT token:', error.message);
      }
    } else {
      console.log('JWT middleware: No authorization header found');
    }
    
    next();
  }
}
