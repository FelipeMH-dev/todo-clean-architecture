import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import * as taskEntity from '../../domain/entities/task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la tarea',
    example: 'Estudiar TypeScript avanzado',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la tarea',
    example: 'Repasar decorators y generics',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la tarea',
    enum: ['pending', 'in_progress', 'done'],
    example: 'in_progress',
  })
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'done'])
  status?: taskEntity.TaskStatus;
}