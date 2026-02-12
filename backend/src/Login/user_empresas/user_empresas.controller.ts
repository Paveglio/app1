import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserEmpresasService } from './user_empresas.service';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';
import { JwtAuthGuard } from '../auth/auth.guards';

/**
 * Controller do vinculo usuario-empresa.
 */
@Controller('user-empresas')
@UseGuards(JwtAuthGuard)
export class UserEmpresasController {
  constructor(private readonly userEmpresasService: UserEmpresasService) {}

  @Post()
  async createUserEmpresa(@Body() userEmpresasDto: CreateUserEmpresaDto | CreateUserEmpresaDto[]) {
    return this.userEmpresasService.createUserEmpresa(userEmpresasDto);
  }

  @Get()
  findAll() {
    return this.userEmpresasService.getUserEmpresas();
  }

  @Get('cpf/:CPF')
  findOneByCpf(@Param('CPF') CPF: string) {
    return this.userEmpresasService.getUserEmpresaCpf(CPF);
  }

  @Get('cnpj/:CNPJ')
  findByCnpj(@Param('CNPJ') CNPJ: string) {
    return this.userEmpresasService.getUserEmpresaCnpj(CNPJ);
  }

  @Patch(':CNPJ')
  updateUserEmpresa(@Param('CNPJ') CNPJ: string, @Body() updateUserEmpresaDto: UpdateUserEmpresaDto) {
    return this.userEmpresasService.updateUserEmpresa(CNPJ, updateUserEmpresaDto);
  }

  @Delete(':CNPJ')
  deleteUserEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.userEmpresasService.deleteUserEmpresa(CNPJ);
  }
}
