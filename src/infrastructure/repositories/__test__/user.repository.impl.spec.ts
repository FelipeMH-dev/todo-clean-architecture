import { UserRepositoryImpl } from '../user.repository.impl';

import { Repository } from 'typeorm';

import { UserOrmEntity } from '../../database/entities/user.orm-entity';
import { UserMapper } from '../../mappers/user.mapper';
import { User } from '../../../domain/entities/user.entity';

describe('UserRepositoryImpl', () => {
  let repo: UserRepositoryImpl;

  let typeormRepo: jest.Mocked<Repository<UserOrmEntity>>;

  beforeEach(() => {
    typeormRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;

    repo = new UserRepositoryImpl(typeormRepo);

    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const domainUser = new User(
      '1',
      'test@mail.com',
      'hashed-password',
      new Date(),
      new Date(),
    );

    const ormUser = {} as UserOrmEntity;
    const savedUser = {} as UserOrmEntity;

    jest.spyOn(UserMapper, 'toOrmEntity').mockReturnValue(ormUser);
    jest.spyOn(UserMapper, 'toDomain').mockReturnValue(domainUser);

    typeormRepo.save.mockResolvedValue(savedUser);

    const result = await repo.create(domainUser);

    expect(typeormRepo.save).toHaveBeenCalledWith(ormUser);
    expect(result).toEqual(domainUser);
  });

  it('should find user by email', async () => {
    const ormUser = {} as UserOrmEntity;

    typeormRepo.findOne.mockResolvedValue(ormUser);

    const domainUser = new User(
      '1',
      'test@mail.com',
      'password',
      new Date(),
      new Date(),
    );

    jest.spyOn(UserMapper, 'toDomain').mockReturnValue(domainUser);

    const result = await repo.findByEmail('test@mail.com');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@mail.com' },
    });

    expect(result).toEqual(domainUser);
  });

  it('should return null when user not found by email', async () => {
    typeormRepo.findOne.mockResolvedValue(null);

    const result = await repo.findByEmail('missing@mail.com');

    expect(result).toBeNull();
  });

  it('should find user by id', async () => {
    const ormUser = {} as UserOrmEntity;

    typeormRepo.findOne.mockResolvedValue(ormUser);

    const domainUser = new User(
      '1',
      'test@mail.com',
      'password',
      new Date(),
      new Date(),
    );

    jest.spyOn(UserMapper, 'toDomain').mockReturnValue(domainUser);

    const result = await repo.findById('1');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    expect(result).toEqual(domainUser);
  });

  it('should return null when user not found by id', async () => {
    typeormRepo.findOne.mockResolvedValue(null);

    const result = await repo.findById('1');

    expect(result).toBeNull();
  });
});