import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '내 정보 조회',
    type: UserDto,
  })
  async findMyProfile(@Req() req: Request) {
    const userId = req['user'].userId;
    return this.usersService.findMyProfile(userId);
  }
}
