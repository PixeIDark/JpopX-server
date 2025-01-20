import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

// 프로필 업데이트를 위한 DTO
class UpdateProfileDto {
  name?: string;
  password?: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
    private readonly usersService: UsersService,
  ) {
  }

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
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

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '프로필 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
    type: UserDto,
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: UpdateProfileDto,
  ) {
    const userId = req['user'].userId;
    return this.usersService.updateProfile(userId, updateData);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원 탈퇴 성공',
  })
  async deleteAccount(@Req() req: Request) {
    const userId = req['user'].userId;
    return this.usersService.deleteAccount(userId);
  }
}