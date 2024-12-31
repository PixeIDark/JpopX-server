import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('lyrics')
@Controller('lyrics')
export class LyricsController {
  @Post()
  @ApiOperation({ summary: '가사 생성' })
  create(@Body() createLyricsDto: {
    song_id: number;
    lyrics_text: string;
  }) {
    // DB 저장 로직
    return createLyricsDto;
  }

  @Get(':songId')
  @ApiOperation({ summary: '특정 노래의 가사 조회' })
  findBySongId(@Param('songId') songId: string) {
    return { songId };
  }

  @Put(':id')
  @ApiOperation({ summary: '가사 수정' })
  update(@Param('id') id: string, @Body() updateLyricsDto: {
    lyrics_text: string;
  }) {
    return { id, ...updateLyricsDto };
  }

  @Delete(':id')
  @ApiOperation({ summary: '가사 삭제' })
  remove(@Param('id') id: string) {
    return { id };
  }
}