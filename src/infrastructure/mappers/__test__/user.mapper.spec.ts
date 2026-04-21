import { UserMapper } from '../user.mapper';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../../database/entities/user.orm-entity';

describe('UserMapper', () => {
  const now = new Date();

  describe('toDomain', () => {
    it('should map ORM entity to domain User correctly', () => {
      const orm = new UserOrmEntity();

      orm.id = 'user-id';
      orm.email = 'test@mail.com';
      orm.password = 'hashed-password';
      orm.createdAt = now;
      orm.updatedAt = now;

      const result = UserMapper.toDomain(orm);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('user-id');
      expect(result.email).toBe('test@mail.com');
      expect(result.password).toBe('hashed-password');
      expect(result.createdAt).toBe(now);
      expect(result.updatedAt).toBe(now);
    });
  });

  describe('toOrmEntity', () => {
    it('should map domain User to ORM entity correctly', () => {
      const user = new User(
        'user-id',
        'test@mail.com',
        'hashed-password',
        now,
        now,
      );

      const result = UserMapper.toOrmEntity(user);

      expect(result).toBeInstanceOf(UserOrmEntity);
      expect(result.id).toBe('user-id');
      expect(result.email).toBe('test@mail.com');
      expect(result.password).toBe('hashed-password');
      expect(result.createdAt).toBe(now);
      expect(result.updatedAt).toBe(now);
    });
  });
});