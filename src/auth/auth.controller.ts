import { Controller, Post, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // req.user is populated by the LocalStrategy's validate method
    return this.authService.login(req.user, req);
  }

  @Post('register')
  async register(@Request() req, @Body() createUserDto: CreateUserDto) {
    // usersService.create returns a SafeUser. We need the full User entity for the login service.
    const safeUser = await this.usersService.create(createUserDto);

    // Fetch the full user entity to get all relations for the login response
    const fullUser = await this.usersService.findById(safeUser.id);
    if (!fullUser) {
      // This should not happen in a normal flow
      throw new UnauthorizedException('Could not log in user after registration.');
    }

    // We can log the user in immediately after registration and return a token
    return this.authService.login(fullUser, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    if (!body || !body.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.logout(body.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    body: { token: string; pass: string; passConfirm: string },
  ) {
    return this.authService.resetPassword(
      body.token,
      body.pass,
      body.passConfirm,
    );
  }
}
