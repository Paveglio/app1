import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './Login/user/user.module';
import { AuthModule } from './Login/auth/auth.module';
import { EmpresasModule } from './Login/empresas/empresas.module';
import { UserEmpresasModule } from './Login/user_empresas/user_empresas.module';
import { TipoUserModule } from './Login/tipo_user/tipo_user.module';
import { ConfigModule } from '@nestjs/config';

/**
 * Modulo raiz da aplicacao.
 * Reune os modulos de autenticacao e os modulos de negocio.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    userModule,
    AuthModule,
    UserEmpresasModule,
    EmpresasModule,
    TipoUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
