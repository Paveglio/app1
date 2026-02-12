import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller de health-check simples da API.
 * Serve como endpoint rapido para validar se o backend esta no ar.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
