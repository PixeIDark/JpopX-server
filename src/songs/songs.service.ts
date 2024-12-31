import { Inject, Injectable } from '@nestjs/common';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class SongsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
  }

  async create(createSongDto: {
    title_ko: string;
    title_ja?: string;
    title_en?: string;
    artist_id: number;
    release_date?: Date;
    thumbnail_url?: string;
  }) {
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

  async update(id: string | number, updateSongDto: {
    title_ko?: string;
    title_ja?: string;
    title_en?: string;
    artist_id?: number;
    release_date?: Date;
    thumbnail_url?: string;
  }) {
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
      updateSongDto.release_date,
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