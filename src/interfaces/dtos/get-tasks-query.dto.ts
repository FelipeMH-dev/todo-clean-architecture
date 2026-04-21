import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import * as taskEntity from '../../domain/entities/task.entity';

export class GetTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de la tarea',
    enum: ['pending', 'in_progress', 'done'],
    example: 'pending',
  })
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'done'])
  status?: taskEntity.TaskStatus;
  
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    default: 10,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}