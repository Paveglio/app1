import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';

/**
 * Guard JWT global para endpoints protegidos.
 *
 * Regras:
 * - ignora validacao para handlers marcados com @Public();
 * - exige header Authorization: Bearer <token>;
 * - valida assinatura e idade do token;
 * - bloqueia token revogado.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('Requisicao sem header de autorizacao');
      throw new UnauthorizedException('Token de autorizacao nao fornecido');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      this.logger.warn('Formato de header invalido');
      throw new UnauthorizedException('Formato do header de autorizacao invalido');
    }

    try {
      if (this.authService.isTokenRevoked(token)) {
        this.logger.warn('Tentativa de uso de token revogado');
        throw new UnauthorizedException('Token foi revogado. Faca login novamente.');
      }

      const decoded = this.jwtService.verify(token);
      if (!decoded.sub) {
        throw new UnauthorizedException('Token invalido: informacoes ausentes');
      }

      const tokenAge = Math.floor(Date.now() / 1000) - (decoded.iat || 0);
      const maxAge = 30 * 24 * 60 * 60;
      if (tokenAge > maxAge) {
        throw new UnauthorizedException('Token expirado');
      }

      // Dados anexados na request para reuso em outros pontos da aplicacao.
      request.user = {
        cpf: decoded.sub,
        iat: decoded.iat,
      };
      request.token = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn(`Erro ao validar token: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado. Faca login novamente.');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token invalido');
      }

      throw new UnauthorizedException('Falha na autenticacao');
    }
  }
}

/**
 * Marca uma rota como publica para o JwtAuthGuard.
 */
export const Public = () => SetMetadata('isPublic', true);
