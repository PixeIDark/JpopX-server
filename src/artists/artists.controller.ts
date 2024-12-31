import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';
import { SongsService } from '../songs/songs.service';
import { ArtistsService } from './artists.service';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly searchService: SearchService,
    private readonly songsService: SongsService,
    private readonly artistsService: ArtistsService,
  ) {
  }

  @Post()
  @ApiOperation({ summary: '가수 생성' })
  async create(@Body() createArtistDto: {
    name_ko: string;
    name_ja?: string;
    name_en?: string;
    profile_image_url?: string;
    is_group?: boolean;
  }) {
    const savedArtist = await this.artistsService.create(createArtistDto);
    return savedArtist;
  }

  @Get()
  @ApiOperation({ summary: '가수 목록 조회' })
  async findAll() {
    const artists = await this.artistsService.findAll();
    return artists;
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 가수 조회' })
  async findOne(@Param('id') id: string) {
    const artist = await this.artistsService.findOne(id);
    return artist;
  }

  @Put(':id')
  @ApiOperation({ summary: '가수 정보 수정' })
  async update(@Param('id') id: string, @Body() updateArtistDto: {
    name_ko?: string;
    name_ja?: string;
    name_en?: string;
    profile_image_url?: string;
    is_group?: boolean;
  }) {
    const updatedArtist = await this.artistsService.update(id, updateArtistDto);

    const songs = await this.songsService.findByArtistId(id);
    for (const song of songs) {
      await this.searchService.updateSearchIndex(
        song.id,
        song,
        updatedArtist,
      );
    }

    return updatedArtist;
  }

  @Delete(':id')
  @ApiOperation({ summary: '가수 삭제' })
  async remove(@Param('id') id: string) {
    const result = await this.artistsService.remove(id);
    return result;
  }
}