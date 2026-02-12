import { IsString, MinLength } from 'class-validator';

/**
 * DTO de upload de certificado.
 * Recebe apenas a senha; o arquivo vem em multipart/form-data.
 */
export class UploadCertificadoDto {
  @IsString()
  @MinLength(1)
  senha: string;
}
