import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Res,
  Inject,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { userService } from './user.service';
import { user } from './entities/user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';
import { Response } from 'express';
import { Workbook } from 'exceljs';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Public } from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';

/**
 * Controller de usuarios.
 *
 * Convencao importante:
 * - todas as rotas sao protegidas por JWT;
 * - exceto POST /user, que eh publico apenas para bootstrap inicial.
 */
@Controller('user')
@UseGuards(JwtAuthGuard)
export class userController {
  constructor(
    private readonly userService: userService,
    private readonly authService: AuthService,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

  @Get()
  getUsers(): Promise<user[]> {
    return this.userService.getUsers();
  }

  @Get(':cpf')
  getUser(@Param('cpf') cpf: string) {
    return this.userService.getUser(cpf);
  }

  @Get('nome/:nome')
  searchUserByName(@Param('nome') nome: string) {
    return this.userService.searchUserByName(nome);
  }

  /**
   * Bootstrap seguro:
   * - se banco vazio, cria primeiro usuario sem token;
   * - depois disso, exige token valido para novos cadastros.
   */
  @Public()
  @Post()
  async createUser(@Req() req: any, @Body() newUser: createUserDto) {
    const hasUsers = await this.userService.hasUsers();

    if (hasUsers) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token de autorizacao nao fornecido');
      }

      await this.authService.validateToken(token);
    }

    return this.userService.createUser(newUser);
  }

  @Delete(':cpf')
  deleteUser(@Param('cpf') cpf: string) {
    return this.userService.deleteUser(cpf);
  }

  @Patch(':cpf')
  updateUser(@Param('cpf') cpf: string, @Body() userDto: updateUserDto) {
    return this.userService.updateUser(cpf, userDto);
  }

  /**
   * Exporta dados de usuarios para planilha.
   * Mantido como SQL direto por simplicidade de formato do relatorio.
   */
  @Get('export/excel')
  async exportUsersToExcel(@Res() res: Response) {
    const usuarios = await this.userRepository.query(`
      SELECT
        u.CPF,
        u.NOME,
        u.EMAIL,
        CASE
          WHEN u.USER_SIS = '1' THEN 'ATIVO'
          WHEN u.USER_SIS = '0' THEN 'DESATIVADO'
          ELSE '0'
        END AS USER_SIS,
        p.DESC_PERMISSAO AS PERMISSAO
      FROM
        [user] u
      LEFT JOIN
        [permissoES] p
      ON
        u.COD_PERMISSAO = p.COD_PERMISSAO;
    `);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    worksheet.columns = [
      { header: 'CPF', key: 'CPF', width: 15 },
      { header: 'NOME', key: 'NOME', width: 30 },
      { header: 'EMAIL', key: 'EMAIL', width: 30 },
      { header: 'USER_SIS', key: 'USER_SIS', width: 10 },
      { header: 'PERMISSAO', key: 'PERMISSAO', width: 30 },
    ];

    usuarios.forEach((item) => {
      worksheet.addRow({
        CPF: item.CPF,
        NOME: item.NOME,
        EMAIL: item.EMAIL,
        USER_SIS: item.USER_SIS,
        PERMISSAO: item.PERMISSAO,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
