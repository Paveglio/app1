import { Injectable } from '@nestjs/common';

/**
 * Service de suporte ao endpoint raiz.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Funcionando!';
  }
}
