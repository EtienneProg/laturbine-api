import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(password: string): Promise<{ token: string }> {
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');

    const isValid = password === adminPassword;
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const token = this.jwt.sign({ role: 'admin' });
    return { token };
  }
}
