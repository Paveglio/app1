import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from './entities/user.providers';
import { userService } from './user.service';
import { userController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * Modulo de usuarios.
 *
 * - gerencia CRUD de usuarios;
 * - depende de AuthModule para validacao de token em regras de bootstrap.
 */
@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [userController],
  providers: [...userProviders, userService],
  exports: [userService],
})
export class userModule {}
