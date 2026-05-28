import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../user/entities/user.entity';
import { UserSession } from '../security/entities/user-session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User, req: Request) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const refreshToken = randomBytes(64).toString('hex');

    const session = this.sessionRepository.create({
      user,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    await this.sessionRepository.save(session);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    session.lastUsedAt = new Date();
    await this.sessionRepository.save(session);

    const user = session.user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.sessionRepository.delete({ refreshToken });
    return { message: 'Déconnecté avec succès' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.setPasswordResetToken(user.id, resetToken, expires);

    // TODO: envoyer l'email avec le resetToken
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(token: string, pass: string, passConfirm: string): Promise<{ message: string }> {
    if (pass !== passConfirm) {
      throw new UnauthorizedException('Les mots de passe ne correspondent pas');
    }

    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user || !user.passwordResetExpires) {
      throw new UnauthorizedException('Token invalide');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Token expiré');
    }

    await this.usersService.updatePassword(user.id, pass);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
