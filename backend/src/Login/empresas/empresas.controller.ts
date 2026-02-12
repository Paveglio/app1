import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { UploadCertificadoDto } from './dto/upload-certificado.dto';
import { JwtAuthGuard } from '../auth/auth.guards';

/**
 * Controller de empresas e certificados digitais.
 */
@Controller('empresa')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  getEmpresas() {
    return this.empresasService.getEmpresas();
  }

  @Get('nome/:NOME')
  searchEmpresaByName(@Param('NOME') NOME: string) {
    return this.empresasService.searchEmpresaByName(NOME);
  }

  @Post()
  createEmpresa(@Body() newEmpresa: CreateEmpresaDto) {
    return this.empresasService.createEmpresa(newEmpresa);
  }

  @Delete(':CNPJ')
  deleteEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.empresasService.deleteEmpresa(CNPJ);
  }

  @Patch(':CNPJ')
  updateEmpresa(@Param('CNPJ') CNPJ: string, @Body() empresa: UpdateEmpresaDto) {
    return this.empresasService.updateEmpresa(CNPJ, empresa);
  }

  /**
   * Upload de certificado .pfx/.p12 com validacoes basicas de tamanho e extensao.
   */
  @Post(':CNPJ/upload-certificado')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const validMimeTypes = ['application/x-pkcs12', 'application/octet-stream'];
        const validExtension =
          file.originalname.toLowerCase().endsWith('.pfx') ||
          file.originalname.toLowerCase().endsWith('.p12');

        if (validExtension || validMimeTypes.includes(file.mimetype)) {
          cb(null, true);
          return;
        }

        cb(new BadRequestException('Arquivo invalido. Envie .pfx ou .p12'), false);
      },
    }),
  )
  async uploadCertificado(
    @Param('CNPJ') CNPJ: string,
    @UploadedFile() file: any,
    @Body() body: UploadCertificadoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (file.buffer.length < 100) {
      throw new BadRequestException('Arquivo de certificado invalido ou corrompido');
    }

    await this.empresasService.salvarCertificado(CNPJ, file.buffer, body.senha);
    return { message: 'Certificado salvo com sucesso' };
  }

  @Get(':CNPJ/certificado')
  async obterCertificado(@Param('CNPJ') cnpj: string) {
    return this.empresasService.obterCertificado(cnpj);
  }

  @Get(':CNPJ/certificado-info')
  async getCertificadoInfo(@Param('CNPJ') cnpj: string) {
    return this.empresasService.getCertificadoInfo(cnpj);
  }

  @Delete(':CNPJ/certificado')
  async removerCertificado(@Param('CNPJ') CNPJ: string) {
    const result = await this.empresasService.removerCertificado(CNPJ);
    return {
      success: true,
      message: 'Certificado removido com sucesso',
      data: result,
    };
  }

  @Get(':CNPJ')
  getEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.empresasService.getEmpresa(CNPJ);
  }
}
