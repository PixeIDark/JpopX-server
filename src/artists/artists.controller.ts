import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  @Post()
  @ApiOperation({ summary: '가수 생성' })
  create(@Body() createArtistDto: {
    name_ko: string;
    name_ja?: string;
    name_en?: string;
    profile_image_url?: string;
    is_group?: boolean;
  }) {
    // DB 저장 로직
    return createArtistDto;
  }

  @Get()
  @ApiOperation({ summary: '가수 목록 조회' })
  findAll() {
    // DB 조회 로직
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 가수 조회' })
  findOne(@Param('id') id: string) {
    return { id };
  }

  @Put(':id')
  @ApiOperation({ summary: '가수 정보 수정' })
  update(@Param('id') id: string, @Body() updateArtistDto: any) {
    return { id, ...updateArtistDto };
  }

  @Delete(':id')
  @ApiOperation({ summary: '가수 삭제' })
  remove(@Param('id') id: string) {
    return { id };
  }
}