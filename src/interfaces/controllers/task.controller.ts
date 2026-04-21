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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
  @ApiOperation({ summary: 'Get user tasks with filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
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
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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