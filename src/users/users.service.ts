import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
  ) {
  }

  async findAll(): Promise<UserDto[]> {
    const [users] = await this.connection.execute(
      'SELECT id, name, email, created_at, updated_at, deleted_at FROM users',
    );
    return users as UserDto[];
  }
}