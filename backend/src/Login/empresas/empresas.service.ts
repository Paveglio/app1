import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Like, Repository } from 'typeorm';
import { createDecipheriv, createCipheriv, randomBytes } from 'crypto';
import * as forge from 'node-forge';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

/**
 * Service de empresas.
 *
 * Ponto principal de manutencao:
 * - dados sensiveis de certificado (senha) sao armazenados criptografados;
 * - metodos publicos nunca retornam senha ou blob do certificado.
 */
@Injectable()
export class EmpresasService {
  constructor(
    @Inject('EMPRESAS_REPOSITORY')
    private empresaRepository: Repository<empresa>,
    private configService: ConfigService,
  ) {}

  /**
   * Chave AES-256 em hexadecimal (64 chars) vinda de CERT_SECRET_KEY.
   */
  private getEncryptionKey(): Buffer {
    const keyHex = this.configService.get<string>('CERT_SECRET_KEY', '');

    if (!keyHex || keyHex.length !== 64) {
      throw new HttpException(
        'CERT_SECRET_KEY invalida. Defina 64 caracteres hex.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return Buffer.from(keyHex, 'hex');
  }

  /**
   * Criptografa segredos com AES-256-GCM no formato enc:v1:iv:tag:data.
   */
  private encryptSecret(value: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `enc:v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  /**
   * Decripta segredos no formato interno.
   * Se o valor nao estiver com prefixo `enc:v1`, retorna como veio (legado).
   */
  private decryptSecret(value: string): string {
    if (!value.startsWith('enc:v1:')) {
      return value;
    }

    const [, , ivB64, tagB64, dataB64] = value.split(':');

    if (!ivB64 || !tagB64 || !dataB64) {
      throw new HttpException('Senha do certificado em formato invalido', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const key = this.getEncryptionKey();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  async createEmpresa(empresaDto: CreateEmpresaDto) {
    const normalizedCnpj = empresaDto.CNPJ.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: { CNPJ: normalizedCnpj },
      select: ['CNPJ'],
    });

    if (empresaFound) {
      throw new HttpException('Empresa ja existe', HttpStatus.CONFLICT);
    }

    const newEmpresa = this.empresaRepository.create({
      ...empresaDto,
      CNPJ: normalizedCnpj,
    });

    return this.empresaRepository.save(newEmpresa);
  }

  async getEmpresaComRelacionamento(cnpj: string): Promise<empresa> {
    return this.empresaRepository.findOne({
      where: { CNPJ: cnpj },
      select: ['CNPJ', 'AMBIENTE_INTEGRACAO_ID'],
    });
  }

  getEmpresas() {
    return this.empresaRepository.find({
      select: ['CNPJ', 'IM', 'NOME', 'OPTANTE_SN', 'OPTANTE_MEI', 'AMBIENTE_INTEGRACAO_ID', 'data_upload'],
    });
  }

  async getEmpresa(CNPJ: string) {
    const normalizedCnpj = CNPJ.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ: normalizedCnpj,
      },
      select: ['CNPJ', 'IM', 'NOME', 'OPTANTE_SN', 'OPTANTE_MEI', 'AMBIENTE_INTEGRACAO_ID', 'data_upload'],
    });

    if (!empresaFound) {
      throw new HttpException('Empresa nao encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  async deleteEmpresa(CNPJ: string) {
    const normalizedCnpj = CNPJ.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ: normalizedCnpj,
      },
      select: ['CNPJ'],
    });

    if (!empresaFound) {
      throw new HttpException('Empresa nao encontrada', HttpStatus.NOT_FOUND);
    }

    return this.empresaRepository.delete({ CNPJ: normalizedCnpj });
  }

  async updateEmpresa(CNPJ: string, empresaDto: UpdateEmpresaDto) {
    const normalizedCnpj = CNPJ.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ: normalizedCnpj,
      },
      select: [
        'CNPJ',
        'IM',
        'NOME',
        'OPTANTE_SN',
        'OPTANTE_MEI',
        'AMBIENTE_INTEGRACAO_ID',
        'certificado',
        'senha',
        'data_upload',
      ],
    });

    if (!empresaFound) {
      throw new HttpException('Empresa nao encontrada', HttpStatus.NOT_FOUND);
    }

    if (empresaDto.CNPJ) {
      empresaDto.CNPJ = empresaDto.CNPJ.replace(/\D/g, '');
    }

    const updatedEmpresa = Object.assign(empresaFound, empresaDto);
    const saved = await this.empresaRepository.save(updatedEmpresa);

    return {
      CNPJ: saved.CNPJ,
      IM: saved.IM,
      NOME: saved.NOME,
      OPTANTE_SN: saved.OPTANTE_SN,
      OPTANTE_MEI: saved.OPTANTE_MEI,
      AMBIENTE_INTEGRACAO_ID: saved.AMBIENTE_INTEGRACAO_ID,
      data_upload: saved.data_upload,
    };
  }

  async searchEmpresaByName(NOME: string): Promise<empresa[]> {
    return this.empresaRepository.find({
      where: {
        NOME: Like(`%${NOME}%`),
      },
      select: ['CNPJ', 'IM', 'NOME', 'OPTANTE_SN', 'OPTANTE_MEI', 'AMBIENTE_INTEGRACAO_ID', 'data_upload'],
    });
  }

  /**
   * Salva certificado e senha criptografada para o CNPJ informado.
   */
  async salvarCertificado(cnpj: string, certificado: Buffer, senha: string) {
    const normalizedCnpj = cnpj.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    if (!certificado || !senha) {
      throw new HttpException('Certificado e senha sao obrigatorios', HttpStatus.BAD_REQUEST);
    }

    const encryptedPassword = this.encryptSecret(senha);
    const existente = await this.empresaRepository.findOne({ where: { CNPJ: normalizedCnpj } });

    if (!existente) {
      throw new HttpException('Empresa nao encontrada', HttpStatus.NOT_FOUND);
    }

    existente.certificado = certificado;
    existente.senha = encryptedPassword;
    existente.data_upload = new Date();

    await this.empresaRepository.save(existente);

    return {
      cnpj: existente.CNPJ,
      data_upload: existente.data_upload,
    };
  }

  /**
   * Endpoint de consulta nao retorna blob nem senha, apenas metadados.
   */
  async obterCertificado(cnpj: string): Promise<{ cnpj: string; possuiCertificado: boolean; data_upload: Date | null }> {
    const normalizedCnpj = cnpj.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: { CNPJ: normalizedCnpj },
      select: ['CNPJ', 'certificado', 'data_upload'],
    });

    if (!empresaFound || !empresaFound.certificado) {
      throw new HttpException('Certificado nao encontrado', HttpStatus.NOT_FOUND);
    }

    return {
      cnpj: empresaFound.CNPJ,
      possuiCertificado: true,
      data_upload: empresaFound.data_upload || null,
    };
  }

  async removerCertificado(cnpj: string) {
    const normalizedCnpj = cnpj.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: { CNPJ: normalizedCnpj },
      select: ['CNPJ', 'certificado', 'senha', 'data_upload'],
    });

    if (!empresaFound || !empresaFound.certificado) {
      throw new HttpException('Certificado nao encontrado', HttpStatus.NOT_FOUND);
    }

    empresaFound.certificado = null;
    empresaFound.senha = null;
    empresaFound.data_upload = null;

    await this.empresaRepository.save(empresaFound);

    return { cnpj: normalizedCnpj, removido: true };
  }

  /**
   * Metodo interno para componentes que realmente precisam assinar com certificado.
   */
  async buscarCertificadoPorCnpj(cnpj: string): Promise<{ pfx: Buffer; passphrase: string }> {
    const normalizedCnpj = cnpj.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: { CNPJ: normalizedCnpj },
      select: ['certificado', 'senha'],
    });

    if (!empresaFound || !empresaFound.certificado || !empresaFound.senha) {
      throw new HttpException('Certificado nao encontrado', HttpStatus.NOT_FOUND);
    }

    const passphrase = this.decryptSecret(empresaFound.senha);

    return {
      pfx: empresaFound.certificado,
      passphrase,
    };
  }

  /**
   * Leitura de metadados do certificado para consulta operacional.
   */
  async getCertificadoInfo(cnpj: string) {
    const { pfx, passphrase } = await this.buscarCertificadoPorCnpj(cnpj);

    try {
      const p12Der = forge.util.createBuffer(pfx.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const cert = certBags[forge.pki.oids.certBag][0].cert;

      const subjectAttrs = cert.subject.attributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      }));

      const issuerAttrs = cert.issuer.attributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      }));

      const now = new Date();
      const vencido = now > cert.validity.notAfter;

      return {
        subject: subjectAttrs,
        issuer: issuerAttrs,
        validade: {
          inicio: cert.validity.notBefore,
          fim: cert.validity.notAfter,
          vencido,
        },
        serialNumber: cert.serialNumber,
      };
    } catch (error) {
      throw new HttpException('Erro ao ler certificado', HttpStatus.BAD_REQUEST);
    }
  }
}
