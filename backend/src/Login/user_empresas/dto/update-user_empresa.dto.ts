import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEmpresaDto } from './create-user_empresa.dto';

/**
 * DTO de atualizacao parcial de vinculo usuario-empresa.
 */
export class UpdateUserEmpresaDto extends PartialType(CreateUserEmpresaDto) {}
