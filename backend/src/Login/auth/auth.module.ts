import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userModule } from '../user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from '../user/entities/user.providers';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserEmpresasProviders } from '../user_empresas/entities/user_empresa.providers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth.guards';

/**
 * Modulo de autenticacao.
 *
 * Responsabilidades:
 * - login/logout;
 * - emissao e validacao de JWT;
 * - guard reutilizavel para proteger endpoints.
 */
@Module({
  imports: [
    // forwardRef evita dependencia circular entre auth e user.
    forwardRef(() => userModule),
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '30d'),
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [AuthService, ...userProviders, ...UserEmpresasProviders, LocalStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
