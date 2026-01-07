import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Get('verify')
  async verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const response = await axios.get('http://auth-service:3000/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        ...response.data,
        _id: response.data.id,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 