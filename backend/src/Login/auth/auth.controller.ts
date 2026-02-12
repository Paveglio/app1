import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, Public } from './auth.guards';
import { LoginDto } from './dto/login.dto';

/**
 * Endpoints de autenticacao.
 *
 * - login: publico, emite token JWT.
 * - logout: protegido, adiciona token na lista de revogados.
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.signIn(loginDto.CPF, loginDto.SENHA);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req): Promise<any> {
    const token = req.token;
    if (token) {
      await this.authService.logout(token);
    }
    return { message: 'Logout successful' };
  }
}
