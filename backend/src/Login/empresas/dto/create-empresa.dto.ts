import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

/**
 * DTO de criacao de empresa.
 */
export class CreateEmpresaDto {
  @IsString()
  @Length(14, 14)
  CNPJ: string;

  @IsString()
  @Length(1, 50)
  IM: string;

  @IsString()
  @Length(1, 300)
  NOME: string;

  @IsString()
  @Length(1, 2)
  OPTANTE_SN: string;

  @IsOptional()
  @IsString()
  @Length(1, 2)
  OPTANTE_MEI: string;

  @IsNumber()
  AMBIENTE_INTEGRACAO_ID: number;
}
