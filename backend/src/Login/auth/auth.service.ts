import {
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { user } from '../user/entities/user.entity';
import { UserEmpresa } from '../user_empresas/entities/user_empresa.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Service central de autenticacao.
 *
 * Responsabilidades:
 * - validar credenciais de login;
 * - aplicar regras de acesso (admin x usuario vinculado a empresa);
 * - emitir e revogar tokens JWT;
 * - validar token para fluxos especificos (ex.: bootstrap seguro).
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Tipo de usuario considerado administrador no sistema.
  private readonly ADMIN_USER_TYPE = '1';

  // Estruturas em memoria (em producao, migrar para Redis com TTL).
  private revokedTokens: Set<string> = new Set();
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000;

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
    @Inject('USER_EMPRESAS_REPOSITORY')
    private userEmpresasRepository: Repository<UserEmpresa>,
    private jwtService: JwtService,
    // Mantido para expansoes futuras de regras configuraveis via .env.
    private configService: ConfigService,
  ) {}

  /**
   * Validacao basica de formato (11 digitos numericos).
   */
  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && /^\d+$/.test(cleanCPF);
  }

  /**
   * Bloqueia tentativas repetidas por CPF para reduzir brute force.
   */
  private checkRateLimit(cpf: string): void {
    const attempts = this.loginAttempts.get(cpf);

    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();

      if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
        if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
          const remainingTime = Math.ceil((this.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);

          this.logger.warn(`Login bloqueado para CPF: ${cpf.substring(0, 3)}***`);
          throw new UnauthorizedException(
            `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`,
          );
        }

        this.loginAttempts.delete(cpf);
      }
    }
  }

  /**
   * Registra sucesso/falha para controle de rate limit por CPF.
   */
  private recordLoginAttempt(cpf: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(cpf);
      return;
    }

    const attempts = this.loginAttempts.get(cpf) || { count: 0, lastAttempt: new Date() };
    attempts.count += 1;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(cpf, attempts);
  }

  async signIn(CPF: string, SENHA: string): Promise<any> {
    try {
      if (!CPF || !SENHA) {
        throw new BadRequestException('CPF e senha sao obrigatorios');
      }

      CPF = CPF.trim().replace(/\D/g, '');

      if (!this.isValidCPF(CPF)) {
        this.logger.warn(`Tentativa de login com CPF invalido: ${CPF.substring(0, 3)}***`);
        throw new BadRequestException('CPF invalido');
      }

      this.checkRateLimit(CPF);

      // SENHA nao eh retornada por padrao na entity, por isso o select explicito.
      const user = await this.userRepository.findOne({
        where: { CPF },
        select: ['CPF', 'NOME', 'SENHA', 'TIPO_USER'],
      });

      if (!user) {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Tentativa de login com CPF nao encontrado: ${CPF.substring(0, 3)}***`);
        throw new UnauthorizedException('Credenciais invalidas');
      }

      const userEmpresa = await this.userEmpresasRepository.findOne({
        where: { CPF },
      });

      // Regra de negocio: admin pode entrar sem vinculo empresa.
      const isAdmin = user.TIPO_USER?.toString().trim() === this.ADMIN_USER_TYPE;
      if ((!userEmpresa || userEmpresa.USER_STATUS.trim() !== '1') && !isAdmin) {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Usuario sem permissao tentou login: ${CPF.substring(0, 3)}***`);
        throw new UnauthorizedException('Usuario nao tem permissao de acesso');
      }

      const isMatch = await bcrypt.compare(SENHA, user.SENHA);
      if (!isMatch) {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Senha incorreta para CPF: ${CPF.substring(0, 3)}***`);
        throw new UnauthorizedException('Credenciais invalidas');
      }

      this.recordLoginAttempt(CPF, true);
      this.logger.log(`Login bem-sucedido: ${CPF.substring(0, 3)}***`);

      // Payload minimo para reduzir exposicao de dados no token.
      const payload = {
        sub: user.CPF,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = await this.jwtService.signAsync(payload);

      const empresas = await this.userEmpresasRepository.find({
        where: { CPF },
        select: ['CNPJ', 'COD_PERMISSAO', 'USER_STATUS'],
      });

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 30 * 24 * 60 * 60,
        user: {
          nome: user.NOME,
          CPF: user.CPF,
          empresas: empresas.map((emp) => ({
            CNPJ: emp.CNPJ,
            COD_PERMISSAO: emp.COD_PERMISSAO,
            USER_STATUS: emp.USER_STATUS,
          })),
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Erro no login: ${error.message}`, error.stack);
      throw new UnauthorizedException('Erro ao processar login');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);

      this.revokedTokens.add(token);

      this.logger.log(`Token revogado para CPF: ${decoded.sub?.substring(0, 3)}***`);
      this.cleanupExpiredTokens();
    } catch (error) {
      this.logger.warn('Tentativa de revogar token invalido');
      throw new UnauthorizedException('Token invalido');
    }
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Placeholder de limpeza. Em Redis, essa tarefa vira TTL automatico.
   */
  private cleanupExpiredTokens(): void {
    if (this.revokedTokens.size > 10000) {
      this.logger.warn('Set de tokens revogados muito grande. Considere usar Redis.');
    }
  }

  /**
   * Valida um token para fluxos que exigem verificacao adicional em banco.
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (this.isTokenRevoked(token)) {
        throw new UnauthorizedException('Token foi revogado');
      }

      const decoded = this.jwtService.verify(token);

      const user = await this.userRepository.findOne({
        where: { CPF: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario nao encontrado');
      }

      const userEmpresa = await this.userEmpresasRepository.findOne({
        where: { CPF: decoded.sub },
      });

      // Mantem regra historica para nao-admin; para admin, permite sem vinculo.
      const isAdmin = user.TIPO_USER?.toString().trim() === this.ADMIN_USER_TYPE;
      if ((!userEmpresa || userEmpresa.USER_STATUS.trim() !== '1') && !isAdmin) {
        throw new UnauthorizedException('Usuario nao tem mais permissao');
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token invalido ou expirado');
    }
  }
}
