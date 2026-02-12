import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

/**
 * Modulo compartilhado de acesso ao banco.
 * Exporta o provider DATA_SOURCE para os demais modulos.
 */
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
