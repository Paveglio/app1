import { IsString, Matches, MinLength } from 'class-validator';

/**
 * DTO do endpoint de login.
 */
export class LoginDto {
  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
  CPF: string;

  @IsString()
  @MinLength(8)
  SENHA: string;
}
