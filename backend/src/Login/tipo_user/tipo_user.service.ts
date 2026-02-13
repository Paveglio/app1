import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TipoUser } from './entities/tipo_user.entity';

/**
 * Inicializa os tipos basicos de usuario.
 */
@Injectable()
export class TipoUserService implements OnModuleInit {
  private readonly logger = new Logger(TipoUserService.name);

  constructor(
    @Inject('TIPO_USER_REPOSITORY')
    private tipoUserRepository: Repository<TipoUser>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultTypes();
  }

  async getTipoUsers(): Promise<TipoUser[]> {
    return this.tipoUserRepository.find({
      order: { COD_TIPO: 'ASC' },
    });
  }

  private async seedDefaultTypes(): Promise<void> {
    const defaults: TipoUser[] = [
      { COD_TIPO: '1', DESC_TIPO: 'Admin' },
      { COD_TIPO: '2', DESC_TIPO: 'Cliente' },
    ];

    for (const item of defaults) {
      const exists = await this.tipoUserRepository.findOne({
        where: { COD_TIPO: item.COD_TIPO },
      });

      if (!exists) {
        await this.tipoUserRepository.save(item);
        this.logger.log(`TIPO_USER criado: ${item.COD_TIPO} - ${item.DESC_TIPO}`);
      }
    }
  }
}
