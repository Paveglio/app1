import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

/**
 * DTO de criacao de usuario.
 */
export class createUserDto {
  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
  CPF: string;

  @IsString()
  @Length(2, 100)
  NOME: string;

  @IsEmail()
  EMAIL: string;

  @IsString()
  @MinLength(8)
  SENHA: string;

  @IsString()
  @Length(1, 2)
  TIPO_USER: string;
}
