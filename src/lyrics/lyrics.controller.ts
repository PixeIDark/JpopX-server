import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';
import { SongsService } from '../songs/songs.service';
import { ArtistsService } from '../artists/artists.service';
import { LyricsService } from './lyrics.service';

@ApiTags('lyrics')
@Controller('lyrics')
export class LyricsController {
  constructor(
    private readonly searchService: SearchService,
    private readonly songsService: SongsService,
    private readonly artistsService: ArtistsService,
    private readonly lyricsService: LyricsService,
  ) {
  }

  @Post()
  @ApiOperation({ summary: '가사 생성' })
  async create(@Body() createLyricsDto: {
    song_id: number;
    lyrics_text: string;
  }) {
    const savedLyrics = await this.lyricsService.create(createLyricsDto);
    const song = await this.songsService.findOne(createLyricsDto.song_id);
    const artist = await this.artistsService.findOne(song.artist_id);

    await this.searchService.updateSearchIndex(
      song.id,
      song,
      artist,
      savedLyrics.lyrics_text,
    );

    return savedLyrics;
  }

  @Get(':songId')
  @ApiOperation({ summary: '특정 노래의 가사 조회' })
  async findBySongId(@Param('songId') songId: string) {
    const lyrics = await this.lyricsService.findBySongId(songId);
    return lyrics;
  }

  @Put(':id')
  @ApiOperation({ summary: '가사 수정' })
  async update(@Param('id') id: string, @Body() updateLyricsDto: {
    lyrics_text: string;
  }) {
    const updatedLyrics = await this.lyricsService.update(id, updateLyricsDto);
    const song = await this.songsService.findOne(updatedLyrics.song_id);
    const artist = await this.artistsService.findOne(song.artist_id);

    await this.searchService.updateSearchIndex(
      song.id,
      song,
      artist,
      updateLyricsDto.lyrics_text,
    );

    return updatedLyrics;
  }

  @Delete(':id')
  @ApiOperation({ summary: '가사 삭제' })
  async remove(@Param('id') id: string) {
    const result = await this.lyricsService.remove(id);
    return result;
  }
}