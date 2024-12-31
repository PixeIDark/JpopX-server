import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';
import { ArtistsService } from '../artists/artists.service';
import { SongsService } from './songs.service';

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
  async create(@Body() createSongDto: {
    title_ko: string;
    title_ja?: string;
    title_en?: string;
    artist_id: number;
    release_date?: Date;
    thumbnail_url?: string;
  }) {
    const savedSong = await this.songsService.create(createSongDto);
    const artist = await this.artistsService.findOne(createSongDto.artist_id);

    await this.searchService.updateSearchIndex(
      savedSong.id,
      savedSong,
      artist,
    );

    return savedSong;
  }

  @Get()
  @ApiOperation({ summary: '노래 목록 조회' })
  async findAll() {
    const songs = await this.songsService.findAll();
    return songs;
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 노래 조회' })
  async findOne(@Param('id') id: string) {
    const song = await this.songsService.findOne(id);
    return song;
  }

  @Put(':id')
  @ApiOperation({ summary: '노래 정보 수정' })
  async update(@Param('id') id: string, @Body() updateSongDto: {
    title_ko?: string;
    title_ja?: string;
    title_en?: string;
    artist_id?: number;
    release_date?: Date;
    thumbnail_url?: string;
  }) {
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
    const result = await this.songsService.remove(id);
    return result;
  }
}