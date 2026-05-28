import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user, req);
  }

  @Post('register')
  async register(@Request() req, @Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) throw new UnauthorizedException('Erreur lors de la connexion après inscription.');
    return this.authService.login(fullUser, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) throw new UnauthorizedException('Refresh token requis');
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    if (!body?.refreshToken) throw new UnauthorizedException('Refresh token requis');
    return this.authService.logout(body.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; pass: string; passConfirm: string }) {
    return this.authService.resetPassword(body.token, body.pass, body.passConfirm);
  }
}
