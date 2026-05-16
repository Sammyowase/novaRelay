import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, tenantName: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const tenant = await this.prisma.tenant.create({
      data: { name: tenantName },
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id,
      },
    });

    return this.generateToken(user.id, user.tenantId);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id, user.tenantId);
  }

  private generateToken(userId: string, tenantId: string) {
    const payload = { sub: userId, tenantId };
    return {
      access_token: this.jwtService.sign(payload),
      userId,
      tenantId,
    };
  }
}
