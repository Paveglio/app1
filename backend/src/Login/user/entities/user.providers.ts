import { DataSource } from 'typeorm';
import { user } from './user.entity';

/**
 * Provider do repositorio de usuarios.
 * Permite injetar `USER_REPOSITORY` sem depender de @nestjs/typeorm.
 */
export const userProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(user),
    inject: ['DATA_SOURCE'],
  },
];
