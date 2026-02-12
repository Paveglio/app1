import { Module } from '@nestjs/common';
import { UserEmpresasService } from './user_empresas.service';
import { UserEmpresasController } from './user_empresas.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserEmpresasProviders } from './entities/user_empresa.providers';
import { AuthModule } from '../auth/auth.module';

/**
 * Modulo de relacionamento usuario x empresa.
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserEmpresasController],
  providers: [...UserEmpresasProviders, UserEmpresasService],
})
export class UserEmpresasModule {}
