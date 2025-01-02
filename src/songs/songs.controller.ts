import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';
import { ArtistsService } from '../artists/artists.service';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { CreateSongCompleteDto } from './dto/create-song-complete.dto';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(
    private readonly searchService: SearchService,
    private readonly artistsService: ArtistsService,
    private readonly songsService: SongsService,
  ) {
  }

  @Post()
  @ApiOperation({ summary: '노래 생성' })
  async create(@Body() createSongDto: CreateSongDto) {
    const savedSong = await this.songsService.create(createSongDto);
    const artist = await this.artistsService.findOne(createSongDto.artist_id);

    await this.searchService.updateSearchIndex(
      savedSong.id,
      savedSong,
      artist,
    );

    return savedSong;
  }

  @Post('complete')
  @ApiOperation({ summary: '노래, 가사, 노래방 번호 일괄 생성' })
  async createComplete(@Body() createCompleteDto: CreateSongCompleteDto) {
    return await this.songsService.createComplete(createCompleteDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: '여러 곡 일괄 생성' })
  async createBulk(@Body() createCompleteDtos: CreateSongCompleteDto[]) {
    const results = [];
    for (const dto of createCompleteDtos) {
      const result = await this.songsService.createComplete(dto);
      results.push(result);
    }
    return results;
  }

  @Get()
  @ApiOperation({ summary: '노래 목록 조회' })
  async findAll() {
    return await this.songsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 노래 조회' })
  async findOne(@Param('id') id: string) {
    return await this.songsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '노래 정보 수정' })
  async update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    const updatedSong = await this.songsService.update(id, updateSongDto);
    const artist = await this.artistsService.findOne(updatedSong.artist_id);

    await this.searchService.updateSearchIndex(
      updatedSong.id,
      updatedSong,
      artist,
    );

    return updatedSong;
  }

  @Delete(':id')
  @ApiOperation({ summary: '노래 삭제' })
  async remove(@Param('id') id: string) {
    return await this.songsService.remove(id);
  }
}