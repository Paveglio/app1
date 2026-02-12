import { DataSource } from 'typeorm';
import { empresa } from './empresa.entity';

/**
 * Provider do repositorio de empresas.
 */
export const empresasProviders = [
  {
    provide: 'EMPRESAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(empresa),
    inject: ['DATA_SOURCE'],
  },
];
