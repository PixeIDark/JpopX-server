import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
  ) {
  }

  async findAll(): Promise<UserDto[]> {
    const [users] = await this.connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at, updated_at, deleted_at FROM users',
    );
    return users as UserDto[];
  }

  async findMyProfile(userId: number): Promise<UserDto> {
    const [users] = await this.connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId],
    );

    if (users.length === 0) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    return users[0] as UserDto;
  }
}