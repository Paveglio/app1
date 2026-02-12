import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entidade de usuarios.
 * SENHA fica com `select: false` para evitar exposicao acidental em consultas.
 */
@Entity('USER')
export class user {
  @PrimaryColumn({ length: 11, unique: true })
  CPF: string;

  @Column({ type: 'varchar', length: 100 })
  NOME: string;

  @Column({ length: 100 })
  EMAIL: string;

  @Column({ length: 255, select: false })
  SENHA: string;

  @Column({ length: 2 })
  TIPO_USER: string;
}
