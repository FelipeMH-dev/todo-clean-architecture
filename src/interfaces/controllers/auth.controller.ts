import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';

import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

import { ApiKeyGuard } from '../../shared/security/guards/api-key.guard';
import { ApiAuthAndValidationErrors } from '../../shared/security/decorators/api-error.decorator';

@ApiTags('Auth')
@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: 'API key required to access endpoints',
})
@Controller('auth')
@UseGuards(ApiKeyGuard)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user account in the system',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already registered',
    schema: {
      example: {
        error: 'Conflict',
        message: 'Email already exists',
        code: 409,
      },
    },
  })
  @ApiAuthAndValidationErrors()
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto.email, dto.password);

    return {
      id: user.id,
      email: user.email,
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user and returns JWT access token',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token',
      },
    },
  })
  @ApiAuthAndValidationErrors()
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }
}