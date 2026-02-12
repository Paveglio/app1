import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Strategy local (usuario/senha).
 * Atualmente nao eh usada diretamente no fluxo principal, mas fica como base
 * para evolucoes com guards do Passport.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {
    super();
  }

  async validate(CPF: string, SENHA: string): Promise<any> {
    const userFound = await this.userRepository.findOne({
      where: { CPF },
      select: ['CPF', 'NOME', 'TIPO_USER', 'SENHA'],
    });

    if (!userFound) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(SENHA, userFound.SENHA);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return userFound;
  }
}
