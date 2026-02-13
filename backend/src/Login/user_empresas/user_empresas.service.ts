import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { cpf, cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { UserEmpresa } from './entities/user_empresa.entity';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';

/**
 * Service de vinculos usuario x empresa.
 */
@Injectable()
export class UserEmpresasService {
  constructor(
    @Inject('USER_EMPRESAS_REPOSITORY')
    private userEmpresaRepository: Repository<UserEmpresa>,
  ) {}

  async createUserEmpresa(userEmpresasDto: CreateUserEmpresaDto | CreateUserEmpresaDto[]) {
    const userEmpresasArray = Array.isArray(userEmpresasDto) ? userEmpresasDto : [userEmpresasDto];
    const resultados = [];

    for (const userEmpresaDto of userEmpresasArray) {
      if (!cnpjValidator.isValid(userEmpresaDto.CNPJ)) {
        throw new HttpException(`CNPJ invalido: ${userEmpresaDto.CNPJ}`, HttpStatus.BAD_REQUEST);
      }

      if (!cpf.isValid(userEmpresaDto.CPF)) {
        throw new HttpException(`CPF invalido: ${userEmpresaDto.CPF}`, HttpStatus.BAD_REQUEST);
      }

      const newUserEmpresa = this.userEmpresaRepository.create({
        ...userEmpresaDto,
      });

      const savedEmpresa = await this.userEmpresaRepository.save(newUserEmpresa);
      resultados.push(savedEmpresa);
    }

    return resultados.length === 1 ? resultados[0] : resultados;
  }

  getUserEmpresas() {
    return this.userEmpresaRepository.find();
  }

  async getUserEmpresaCnpj(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresas = await this.userEmpresaRepository.find({
      where: { CNPJ },
    });

    if (!empresas.length) {
      throw new HttpException('Nenhum usuario-empresa encontrado para o CNPJ fornecido', HttpStatus.NOT_FOUND);
    }

    return empresas;
  }

  async getUserEmpresaCpf(CPF: string) {
    if (!cpf.isValid(CPF)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    return this.userEmpresaRepository.find({
      where: { CPF },
    });
  }

  async updateUserEmpresa(CNPJ: string, userEmpresaDto: UpdateUserEmpresaDto) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    const empresa = await this.userEmpresaRepository.findOne({
      where: { CNPJ },
    });

    if (!empresa) {
      throw new HttpException('Usuario-empresa nao encontrado', HttpStatus.NOT_FOUND);
    }

    const updatedEmpresa = Object.assign(empresa, userEmpresaDto);
    return this.userEmpresaRepository.save(updatedEmpresa);
  }

  async deleteUserEmpresa(CNPJ: string, CPF: string) {
    const normalizedCnpj = CNPJ.replace(/\D/g, '');
    const normalizedCpf = CPF.replace(/\D/g, '');

    if (!cnpjValidator.isValid(normalizedCnpj)) {
      throw new HttpException('CNPJ invalido', HttpStatus.BAD_REQUEST);
    }

    if (!cpf.isValid(normalizedCpf)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    const empresa = await this.userEmpresaRepository.findOne({
      where: { CNPJ: normalizedCnpj, CPF: normalizedCpf },
    });

    if (!empresa) {
      throw new HttpException('Usuario-empresa nao encontrado para o par CNPJ/CPF informado', HttpStatus.NOT_FOUND);
    }

    return this.userEmpresaRepository.delete({ CNPJ: normalizedCnpj, CPF: normalizedCpf });
  }
}
