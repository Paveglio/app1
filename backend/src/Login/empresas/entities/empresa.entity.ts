import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entidade de empresas.
 *
 * `certificado` e `senha` sao dados sensiveis usados no fluxo de assinatura.
 */
@Entity('EMPRESAS')
export class empresa {
  @PrimaryColumn({ type: 'text', length: 14 })
  CNPJ: string;

  @Column({ type: 'text', length: 50, nullable: true })
  IM: string;

  @Column({ type: 'text', length: 300 })
  NOME: string;

  @Column({ type: 'text', length: 2 })
  OPTANTE_SN: string;

  @Column({ type: 'text', length: 2, nullable: true })
  OPTANTE_MEI: string;

  @Column({ nullable: true })
  AMBIENTE_INTEGRACAO_ID: number;

  @Column({ type: 'blob', nullable: true })
  certificado: Buffer;

  // Armazena senha do certificado no formato criptografado do service.
  @Column({ type: 'text', nullable: true })
  senha: string;

  @Column({ type: 'datetime', nullable: true })
  data_upload: Date;
}
