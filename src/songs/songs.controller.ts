import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  @Post()
  @ApiOperation({ summary: '노래 생성' })
  create(@Body() createSongDto: {
    title_ko: string;
    title_ja?: string;
    title_en?: string;
    artist_id: number;
    release_date?: Date;
    thumbnail_url?: string;
  }) {
    // DB 저장 로직
    return createSongDto;
  }

  @Get()
  @ApiOperation({ summary: '노래 목록 조회' })
  findAll() {
    // DB 조회 로직
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 노래 조회' })
  findOne(@Param('id') id: string) {
    return { id };
  }

  @Put(':id')
  @ApiOperation({ summary: '노래 정보 수정' })
  update(@Param('id') id: string, @Body() updateSongDto: any) {
    return { id, ...updateSongDto };
  }

  @Delete(':id')
  @ApiOperation({ summary: '노래 삭제' })
  remove(@Param('id') id: string) {
    return { id };
  }
}