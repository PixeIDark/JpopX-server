import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 생성' })
  @ApiResponse({ status: 201, description: '레시피 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async create(@Req() req: Request, @Body() createRecipeDto: CreateRecipeDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('유효한 사용자 정보가 없습니다.');
    }
    return this.recipesService.create(createRecipeDto, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '레시피 상세 조회' })
  @ApiResponse({ status: 200, description: '레시피 조회 성공' })
  @ApiResponse({ status: 404, description: '레시피를 찾을 수 없음' })
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(+id);
  }
}