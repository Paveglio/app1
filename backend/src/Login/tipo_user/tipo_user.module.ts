import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { tipoUserProviders } from './entities/tipo_user.providers';
import { TipoUserService } from './tipo_user.service';
import { TipoUserController } from './tipo_user.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * Modulo de tipos de usuario.
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TipoUserController],
  providers: [...tipoUserProviders, TipoUserService],
  exports: [TipoUserService, ...tipoUserProviders],
})
export class TipoUserModule {}
