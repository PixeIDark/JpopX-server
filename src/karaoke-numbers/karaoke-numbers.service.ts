import { Inject, Injectable } from '@nestjs/common';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { CreateKaraokeNumberDto } from './dto/create-karaoke-number.dto';
import { UpdateKaraokeNumberDto } from './dto/update-karaoke-number.dto';

@Injectable()
export class KaraokeNumbersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
  }

  async create(createDto: CreateKaraokeNumberDto) {
    const query = `
    INSERT INTO karaoke_numbers 
      (song_id, tk_number, kumyoung_number)
    VALUES (?, ?, ?)
  `;

    const [result] = await this.connection.execute<ResultSetHeader>(query, [
      createDto.song_id,
      createDto.tk_number,
      createDto.kumyoung_number,
    ]);

    return { id: result.insertId, ...createDto };
  }

  async update(id: string | number, updateDto: UpdateKaraokeNumberDto) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;

    const query = `
    UPDATE karaoke_numbers
    SET 
      tj_number = COALESCE(?, tj_number),
      kumyoung_number = COALESCE(?, kumyoung_number)
    WHERE id = ?
  `;

    await this.connection.execute(query, [
      updateDto.tj_number,
      updateDto.kumyoung_number,
      numericId,
    ]);

    const [rows] = await this.connection.execute(
      'SELECT * FROM karaoke_numbers WHERE id = ?',
      [numericId],
    );

    return rows[0];
  }

  async findBySongId(songId: string | number) {
    const numericId = typeof songId === 'string' ? parseInt(songId) : songId;
    const [rows] = await this.connection.execute(
      'SELECT * FROM karaoke_numbers WHERE song_id = ?',
      [numericId],
    );
    return rows;
  }
}