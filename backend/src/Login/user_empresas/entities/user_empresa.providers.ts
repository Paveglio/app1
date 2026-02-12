import { DataSource } from 'typeorm';
import { UserEmpresa } from './user_empresa.entity';

/**
 * Provider do repositorio de USER_EMPRESAS.
 */
export const UserEmpresasProviders = [
  {
    provide: 'USER_EMPRESAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEmpresa),
    inject: ['DATA_SOURCE'],
  },
];
