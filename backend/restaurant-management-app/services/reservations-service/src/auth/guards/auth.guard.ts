import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-request.interface';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = req.headers['authorization'];
    const jwtFromCookie = req.cookies?.jwt;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : jwtFromCookie;

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      // First verify with auth-service
      const authResponse = await axios.get('http://auth-service:3000/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then verify with restaurant-service
      const restaurantResponse = await axios.get('http://restaurant-service:3001/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      req.user = {
        ...authResponse.data,
        _id: authResponse.data.id,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
