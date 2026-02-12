import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './Login/user/user.module';
import { AuthModule } from './Login/auth/auth.module';
import { EmpresasModule } from './Login/empresas/empresas.module';
import { UserEmpresasModule } from './Login/user_empresas/user_empresas.module';

/**
 * Modulo raiz da aplicacao.
 * Reune os modulos de autenticacao e os modulos de negocio.
 */
@Module({
  imports: [userModule, AuthModule, UserEmpresasModule, EmpresasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
