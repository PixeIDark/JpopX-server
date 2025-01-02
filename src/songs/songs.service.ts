import { Inject, Injectable } from '@nestjs/common';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { CreateSongCompleteDto } from './dto/create-song-complete.dto';
import { SearchService } from '../search/search.service';
import { LyricsService } from '../lyrics/lyrics.service';
import { ArtistsService } from '../artists/artists.service';
import { KaraokeNumbersService } from '../karaoke-numbers/karaoke-numbers.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
    private readonly searchService: SearchService,
    private readonly lyricsService: LyricsService,
    private readonly artistsService: ArtistsService,
    private readonly karaokeNumbersService: KaraokeNumbersService,
  ) {
  }

  async create(createSongDto: CreateSongDto) {
    const query = `
      INSERT INTO songs 
        (title_ko, title_ja, title_en, artist_id, release_date, thumbnail_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.connection.execute<ResultSetHeader>(query, [
      createSongDto.title_ko,
      createSongDto.title_ja,
      createSongDto.title_en,
      createSongDto.artist_id,
      createSongDto.release_date,
      createSongDto.thumbnail_url,
    ]);

    return { id: result.insertId, ...createSongDto };
  }

  async createComplete(createCompleteDto: CreateSongCompleteDto) {
    let savedSong;

    try {
      await this.connection.execute('START TRANSACTION');

      // 1. 노래 생성
      savedSong = await this.create(createCompleteDto.song);

      // 2. 가사 생성 (있는 경우)
      if (createCompleteDto.lyrics) {
        await this.lyricsService.create({
          song_id: savedSong.id,
          lyrics_text: createCompleteDto.lyrics.lyrics_text,
        });
      }

      // 3. 노래방 번호 생성 (있는 경우)
      if (createCompleteDto.karaokeNumbers?.length) {
        for (const karaokeNumber of createCompleteDto.karaokeNumbers) {
          await this.karaokeNumbersService.create({
            ...karaokeNumber,
            song_id: savedSong.id,
          });
        }
      }

      await this.connection.execute('COMMIT');

      // 트랜잭션이 성공적으로 완료된 후에 검색 인덱스 업데이트
      const artist = await this.artistsService.findOne(savedSong.artist_id);
      await this.searchService.updateSearchIndex(
        savedSong.id,
        savedSong,
        artist,
        createCompleteDto.lyrics?.lyrics_text,
      );

      return savedSong;
    } catch (error) {
      console.error('에러 발생! 롤백 실행:', error);
      await this.connection.execute('ROLLBACK');
      throw error;
    }
  }

  async findAll() {
    const [rows] = await this.connection.query<RowDataPacket[]>('SELECT * FROM songs');
    return rows;
  }

  async findOne(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const [rows] = await this.connection.execute(
      'SELECT * FROM songs WHERE id = ?',
      [numericId],
    );
    return rows[0];
  }

  async findByArtistId(artistId: string | number) {
    const numericId = typeof artistId === 'string' ? parseInt(artistId) : artistId;
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      'SELECT * FROM songs WHERE artist_id = ?',
      [numericId],
    );
    return rows;
  }

  async update(id: string | number, updateSongDto: UpdateSongDto) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const query = `
    UPDATE songs
    SET 
      title_ko = COALESCE(?, title_ko),
      title_ja = COALESCE(?, title_ja),
      title_en = COALESCE(?, title_en),
      artist_id = COALESCE(?, artist_id),
      release_date = COALESCE(?, release_date),
      thumbnail_url = COALESCE(?, thumbnail_url)
    WHERE id = ?
  `;

    await this.connection.execute(query, [
      updateSongDto.title_ko,
      updateSongDto.title_ja,
      updateSongDto.title_en,
      updateSongDto.artist_id,
      updateSongDto.release_date,  // string으로 받아서 DB에서 자동으로 Date로 변환
      updateSongDto.thumbnail_url,
      numericId,
    ]);

    return this.findOne(numericId);
  }

  async remove(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    await this.connection.execute('DELETE FROM songs WHERE id = ?', [numericId]);
    return { id: numericId };
  }

}