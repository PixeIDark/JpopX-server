import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool, private readonly usersService: UsersService,
  ) {
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: '유저목록 조회',
    type: [UserDto],
  })
  async findAll() {
    return this.usersService.findAll();
  }
}
