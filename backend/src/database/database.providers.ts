import { DataSource } from 'typeorm';

/**
 * Provider de conexao TypeORM.
 *
 * Observacao de manutencao:
 * - `synchronize` fica desativado em producao;
 * - para ambiente produtivo, prefira migrations versionadas.
 */
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
      });

      return dataSource.initialize();
    },
  },
];
