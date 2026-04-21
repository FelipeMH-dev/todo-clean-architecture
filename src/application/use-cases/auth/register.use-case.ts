import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();

    const user = new User(
      randomUUID(),     // id
      email,
      hashedPassword,
      now,              // createdAt
      now,              // updatedAt
    );

    return this.userRepository.create(user);
  }
}