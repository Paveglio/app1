import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';

/**
 * DTO de atualizacao parcial de empresa.
 */
export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
