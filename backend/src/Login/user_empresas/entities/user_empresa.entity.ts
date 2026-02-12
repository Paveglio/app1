import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entidade de relacionamento N:N entre usuario e empresa.
 */
@Entity('USER_EMPRESAS')
export class UserEmpresa {
  @PrimaryColumn({ length: 14 })
  CNPJ: string;

  @PrimaryColumn({ length: 11 })
  CPF: string;

  @Column({ length: 2 })
  COD_PERMISSAO: string;

  @Column({ length: 2 })
  USER_STATUS: string;
}
