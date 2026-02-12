import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { DatabaseModule } from 'src/database/database.module';
import { empresasProviders } from './entities/empresa.providers';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

/**
 * Modulo de empresas.
 *
 * Inclui gestao cadastral e gerenciamento de certificado digital por CNPJ.
 */
@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule],
  controllers: [EmpresasController],
  providers: [...empresasProviders, EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
