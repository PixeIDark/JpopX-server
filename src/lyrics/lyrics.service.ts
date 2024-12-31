import { Inject, Injectable } from '@nestjs/common';
import { Connection, ResultSetHeader } from 'mysql2/promise';

@Injectable()
export class LyricsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
  }

  async create(createLyricsDto: {
    song_id: number;
    lyrics_text: string;
  }) {
    const query = `
     INSERT INTO lyrics (song_id, lyrics_text)
     VALUES (?, ?)
   `;

    const [result] = await this.connection.execute<ResultSetHeader>(query, [
      createLyricsDto.song_id,
      createLyricsDto.lyrics_text,
    ]);

    return { id: result.insertId, ...createLyricsDto };
  }

  async findBySongId(songId: string | number) {
    const numericId = typeof songId === 'string' ? parseInt(songId) : songId;
    const [rows] = await this.connection.execute(
      'SELECT * FROM lyrics WHERE song_id = ?',
      [numericId],
    );
    return rows[0];
  }

  async findOne(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const [rows] = await this.connection.execute(
      'SELECT * FROM lyrics WHERE id = ?',
      [numericId],
    );
    return rows[0];
  }

  async update(id: string | number, updateLyricsDto: {
    lyrics_text: string;
  }) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const query = `
     UPDATE lyrics
     SET lyrics_text = ?
     WHERE id = ?
   `;

    await this.connection.execute(query, [
      updateLyricsDto.lyrics_text,
      numericId,
    ]);

    return this.findOne(numericId);
  }

  async remove(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    await this.connection.execute('DELETE FROM lyrics WHERE id = ?', [numericId]);
    return { id: numericId };
  }
}