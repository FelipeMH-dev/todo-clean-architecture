import { LoginUseCase } from '../login.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    useCase = new LoginUseCase(userRepository, jwtService);

    jest.clearAllMocks();
  });

  it('should throw if user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('test@mail.com', '1234'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      password: 'hashed-password',
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute('test@mail.com', 'wrong-pass'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return access token when credentials are valid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      password: 'hashed-password',
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jwtService.sign.mockReturnValue('jwt-token');

    const result = await useCase.execute(
      'test@mail.com',
      'correct-password',
    );

    expect(result).toEqual({
      access_token: 'jwt-token',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'test@mail.com',
    });
  });
});