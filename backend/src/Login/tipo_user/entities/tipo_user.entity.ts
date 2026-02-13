import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Tabela de tipos de usuario.
 */
@Entity('TIPO_USER')
export class TipoUser {
  @PrimaryColumn({ type: 'text', length: 2 })
  COD_TIPO: string;

  @Column({ type: 'text', length: 100 })
  DESC_TIPO: string;
}

