import { IsString, Length } from 'class-validator';

/**
 * DTO de criacao de vinculo usuario-empresa.
 */
export class CreateUserEmpresaDto {
  @IsString()
  @Length(14, 14)
  CNPJ: string;

  @IsString()
  @Length(11, 11)
  CPF: string;

  @IsString()
  COD_PERMISSAO: string;

  @IsString()
  USER_STATUS: string;
}
