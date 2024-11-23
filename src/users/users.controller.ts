import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: '유저목록 조회',
    type: [UserDto],
  })
  async findAll() {
    const [users] = await this.connection.execute(
      'SELECT id, name, email, created_at, updated_at, deleted_at FROM users',
    );
    return users;
  }
}
