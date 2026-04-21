import { RegisterUseCase } from '../register.use-case';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../domain/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    useCase = new RegisterUseCase(userRepository);

    jest.clearAllMocks();
  });

  it('should throw ConflictException if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
    } as any);

    await expect(
      useCase.execute('test@mail.com', '1234'),
    ).rejects.toThrow(ConflictException);
  });

  it('should create and return a new user when email is free', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const mockUser = {
      id: 'uuid-123',
      email: 'test@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.create.mockResolvedValue(mockUser as User);

    const result = await useCase.execute(
      'test@mail.com',
      'plain-password',
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);

    expect(userRepository.create).toHaveBeenCalled();

    expect(result).toEqual(mockUser);
  });
});