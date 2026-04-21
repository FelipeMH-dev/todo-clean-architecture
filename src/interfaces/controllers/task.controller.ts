import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { GetTasksUseCase } from '../../application/use-cases/task/get-tasks.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';

import { JwtAuthGuard } from '../../shared/security/guards/jwt.guard';
import { ApiKeyGuard } from '../../shared/security/guards/api-key.guard';
import { CurrentUser } from '../../shared/security/decorators/current-user.decorator';

import { CreateTaskDto } from '../dtos/create-task.dto';
import { GetTasksQueryDto } from '../dtos/get-tasks-query.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { JwtUser } from '../../shared/security/auth/jwt-user.interface';

@ApiTags('Tasks')
@ApiBearerAuth('jwt')
@ApiUnauthorizedResponse({
  description: 'Missing or invalid JWT token',
  schema: {
    example: {
      error: 'ERROR',
      message: 'Unauthorized',
      code: 401,
    },
  },
})
@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: 'API key required to access endpoints',
})
@ApiUnauthorizedResponse({
  description: 'Missing or invalid API Key',
  schema: {
    example: {
      error: 'Unauthorized',
      message: 'Invalid API Key',
      code: 401,
    },
  },
})
@Controller('tasks')
@UseGuards(JwtAuthGuard, ApiKeyGuard)
export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly getTasks: GetTasksUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })

  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4',
        title: 'Hacer la tarea',
        description: 'Resolver ejercicios de matemáticas',
        status: 'pending',
        userId: 'uuid-user',
        createdAt: '2026-04-21T12:00:00.000Z',
        updatedAt: '2026-04-21T12:00:00.000Z',
      },
    },
  })

  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        error: 'Bad Request',
        message: [
          'title must be a string',
          'title must be longer than or equal to 3 characters',
          'title must be shorter than or equal to 100 characters',
        ],
        code: 400,
      },
    },
  })
  create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.createTask.execute({
      userId: user.id,
      title: dto.title,
      description: dto.description,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get user tasks with filters and pagination' })

  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'in_progress', 'done'],
    description: 'Filter tasks by status',
    example: 'pending',
  })

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (starts at 1)',
  })

  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of results per page (max 100)',
  })

  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'df164145-c7cd-4c27-991d-c0f5699031e2',
            title: 'Estudiar TypeScript',
            description: 'Repasar generics y decorators',
            status: 'pending',
            createdAt: '2026-04-21T10:00:00.000Z',
          },
        ],

        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,

      },
    },
  })

  find(
    @CurrentUser() user: JwtUser,
    @Query() query: GetTasksQueryDto,
  ) {
    return this.getTasks.execute(
      user.id,
      query.status,
      query.page,
      query.limit,
    );
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })

  @ApiParam({
    name: 'id',
    type: String,
    description: 'Task UUID',
    example: 'df164145-c7cd-4c27-991d-c0f5699031e2',
  })

  @ApiBody({
    type: UpdateTaskDto,
    description: 'Campos opcionales para actualizar la tarea',
    examples: {
      example1: {
        summary: 'Update title and status',
        value: {
          title: 'Estudiar TypeScript avanzado',
          status: 'in_progress',
        },
      },
      example2: {
        summary: 'Update only description',
        value: {
          description: 'Repasar decorators y generics',
        },
      },
    },
  })

  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      example: {
        id: 'df164145-c7cd-4c27-991d-c0f5699031e2',
        title: 'Estudiar TypeScript avanzado',
        description: 'Repasar decorators y generics',
        status: 'in_progress',
        updatedAt: '2026-04-21T12:30:00.000Z',
      },
    },
  })

  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        error: 'Bad Request',
        message: [
          'status must be one of the following values: pending, in_progress, done',
          'title must be shorter than or equal to 100 characters',
        ],
        code: 400,
      },
    },
  })

  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task not found',
      },
    },
  })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.updateTask.execute(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      example: {
        message: 'Task deleted successfully',
        taskId: 'uuid',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(
    @CurrentUser() user: JwtUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.deleteTask.execute(user.id, id);
  }
}