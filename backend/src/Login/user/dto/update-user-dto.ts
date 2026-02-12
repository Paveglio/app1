import { PartialType } from '@nestjs/mapped-types';
import { createUserDto } from './create-user-dto';

/**
 * DTO de atualizacao parcial de usuario.
 */
export class updateUserDto extends PartialType(createUserDto) {}
