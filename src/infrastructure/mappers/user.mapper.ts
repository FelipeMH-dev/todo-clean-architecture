import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/entities/user.orm-entity';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();

    entity.id = user.id;
    entity.email = user.email;
    entity.password = user.password;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }
}