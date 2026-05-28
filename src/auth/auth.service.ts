import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserSession } from '../security/entities/user-session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Return the full user object, as relations are eagerly loaded
      return user;
    }
    return null;
  }

  async login(user: User, req: Request) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles.map(r => r.name)
    };

    const refreshToken = randomBytes(64).toString('hex');

    // Create a new session
    const session = this.sessionRepository.create({
      user,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    await this.sessionRepository.save(session);

    this.eventEmitter.emit('auth.login.success', {
      user,
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: user, // Return the full user object to the frontend
    };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user', 'user.roles'],
    });

    if (!session) {
      throw new UnauthorizedException('Access Denied: Invalid refresh token');
    }

    // Update last used timestamp
    session.lastUsedAt = new Date();
    await this.sessionRepository.save(session);

    const user = session.user;
    const payload = { email: user.email, sub: user.id, roles: user.roles.map(r => r.name) };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const result = await this.sessionRepository.delete({ refreshToken });
    if (result.affected === 0) {
      // Fail silently to prevent token scanning
      console.log(`Logout attempt with invalid refresh token.`);
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // To prevent user enumeration, we don't throw an error.
      // In a real app, we would log this attempt but send a generic success response.
      console.log(`Password reset attempt for non-existent user: ${email}`);
      // We return a dummy token to complete the simulation flow, but in a real app, nothing would be returned.
      return { resetToken: 'dummy-token-for-simulation' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    await this.usersService.setPasswordResetToken(user.id, resetToken, expires);

    // In a real application, you would email this token to the user.
    // For this simulation, we return it in the response.
    console.log(`Generated password reset token for ${email}: ${resetToken}`);
    return { resetToken };
  }

  async resetPassword(
    token: string,
    pass: string,
    passConfirm: string,
  ): Promise<{ message: string }> {
    if (pass !== passConfirm) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user || !user.passwordResetExpires) {
      throw new UnauthorizedException('Invalid token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Token has expired');
    }

    await this.usersService.updatePassword(user.id, pass);

    return { message: 'Password has been reset successfully' };
  }
}
