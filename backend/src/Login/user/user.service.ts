import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { user } from './entities/user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

/**
 * Service de usuarios.
 *
 * Regras aplicadas aqui:
 * - normalizacao de CPF;
 * - hash de senha com bcrypt;
 * - resposta sempre sem campo SENHA.
 */
@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

  async createUser(userDto: createUserDto) {
    const normalizedCpf = userDto.CPF.replace(/\D/g, '');

    if (!cpfValidator.isValid(normalizedCpf)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    const userFound = await this.userRepository.findOne({
      where: {
        CPF: normalizedCpf,
      },
      select: ['CPF'],
    });

    if (userFound) {
      throw new HttpException('Usuario ja existe', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userDto.SENHA, 10);

    const newUser = this.userRepository.create({
      ...userDto,
      CPF: normalizedCpf,
      SENHA: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    const { SENHA, ...safeUser } = savedUser;
    return safeUser;
  }

  // Usado no bootstrap para saber se o primeiro usuario ja foi criado.
  async hasUsers(): Promise<boolean> {
    const totalUsers = await this.userRepository.count();
    return totalUsers > 0;
  }

  getUsers() {
    return this.userRepository.find({
      select: ['CPF', 'NOME', 'EMAIL', 'TIPO_USER'],
    });
  }

  async getUser(CPF: string) {
    const normalizedCpf = CPF.replace(/\D/g, '');

    if (!cpfValidator.isValid(normalizedCpf)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    const userFound = await this.userRepository.findOne({
      where: {
        CPF: normalizedCpf,
      },
      select: ['CPF', 'NOME', 'EMAIL', 'TIPO_USER'],
    });

    if (!userFound) {
      throw new HttpException('Usuario nao encontrado', HttpStatus.NOT_FOUND);
    }

    return userFound;
  }

  async deleteUser(CPF: string) {
    const normalizedCpf = CPF.replace(/\D/g, '');

    if (!cpfValidator.isValid(normalizedCpf)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    const userFound = await this.userRepository.findOne({
      where: {
        CPF: normalizedCpf,
      },
      select: ['CPF'],
    });

    if (!userFound) {
      throw new HttpException('Usuario nao encontrado', HttpStatus.NOT_FOUND);
    }

    return this.userRepository.delete({ CPF: normalizedCpf });
  }

  async updateUser(CPF: string, userDto: updateUserDto) {
    const normalizedCpf = CPF.replace(/\D/g, '');

    if (!cpfValidator.isValid(normalizedCpf)) {
      throw new HttpException('CPF invalido', HttpStatus.BAD_REQUEST);
    }

    const userFound = await this.userRepository.findOne({
      where: {
        CPF: normalizedCpf,
      },
      select: ['CPF', 'NOME', 'EMAIL', 'TIPO_USER', 'SENHA'],
    });

    if (!userFound) {
      throw new HttpException('Usuario nao encontrado', HttpStatus.NOT_FOUND);
    }

    if (userDto.SENHA) {
      userDto.SENHA = await bcrypt.hash(userDto.SENHA, 10);
    }

    if (userDto.CPF) {
      userDto.CPF = userDto.CPF.replace(/\D/g, '');
    }

    const updatedUser = Object.assign(userFound, userDto);
    const savedUser = await this.userRepository.save(updatedUser);
    const { SENHA, ...safeUser } = savedUser;
    return safeUser;
  }

  async searchUserByName(nome: string): Promise<user[]> {
    return this.userRepository.find({
      where: {
        NOME: Like(`%${nome}%`),
      },
      select: ['CPF', 'NOME', 'EMAIL', 'TIPO_USER'],
    });
  }

  async exportUsersToExcel(): Promise<user[]> {
    return this.userRepository.find({
      select: ['CPF', 'NOME', 'EMAIL', 'TIPO_USER'],
    });
  }
}
