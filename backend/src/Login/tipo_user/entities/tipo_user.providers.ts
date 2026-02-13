import { DataSource } from 'typeorm';
import { TipoUser } from './tipo_user.entity';

/**
 * Provider do repositorio de tipo de usuario.
 */
export const tipoUserProviders = [
  {
    provide: 'TIPO_USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TipoUser),
    inject: ['DATA_SOURCE'],
  },
];

