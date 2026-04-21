import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';

import { RegisterUseCase } from '../../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';

import { RegisterDto } from '../../dtos/register.dto';
import { LoginDto } from '../../dtos/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const registerUseCaseMock = {
    execute: jest.fn(),
  };

  const loginUseCaseMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: registerUseCaseMock },
        { provide: LoginUseCase, useValue: loginUseCaseMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  /**
   * =========================
   * REGISTER
   * =========================
   */
  describe('register', () => {
    it('should register a user and return id + email', async () => {
      registerUseCaseMock.execute.mockResolvedValue({
        id: 'user-id',
        email: 'test@mail.com',
      });

      const dto: RegisterDto = {
        email: 'test@mail.com',
        password: '123456',
      };

      const result = await controller.register(dto);

      expect(registerUseCaseMock.execute).toHaveBeenCalledWith(
        'test@mail.com',
        '123456',
      );

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@mail.com',
      });
    });
  });

  /**
   * =========================
   * LOGIN
   * =========================
   */
  describe('login', () => {
    it('should return access token', async () => {
      loginUseCaseMock.execute.mockResolvedValue({
        access_token: 'jwt-token',
      });

      const dto: LoginDto = {
        email: 'test@mail.com',
        password: '123456',
      };

      const result = await controller.login(dto);

      expect(loginUseCaseMock.execute).toHaveBeenCalledWith(
        'test@mail.com',
        '123456',
      );

      expect(result).toEqual({
        access_token: 'jwt-token',
      });
    });
  });
});