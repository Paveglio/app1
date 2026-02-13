import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { TipoUserService } from './tipo_user.service';
import { TipoUser } from './entities/tipo_user.entity';

/**
 * Controller de tipos de usuario.
 */
@Controller('tipo-user')
@UseGuards(JwtAuthGuard)
export class TipoUserController {
  constructor(private readonly tipoUserService: TipoUserService) {}

  @Get()
  getTipoUsers(): Promise<TipoUser[]> {
    return this.tipoUserService.getTipoUsers();
  }
}

