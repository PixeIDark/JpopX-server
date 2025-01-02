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
        (song_id, brand, number, is_active, last_verified_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.connection.execute<ResultSetHeader>(query, [
      createDto.song_id,
      createDto.brand,
      createDto.number,
      createDto.is_active ?? true,
      createDto.last_verified_at || new Date(),
    ]);

    return { id: result.insertId, ...createDto };
  }

  async update(id: string | number, updateDto: UpdateKaraokeNumberDto) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;

    const query = `
      UPDATE karaoke_numbers
      SET 
        number = COALESCE(?, number),
        is_active = COALESCE(?, is_active),
        last_verified_at = COALESCE(?, last_verified_at)
      WHERE id = ?
    `;

    await this.connection.execute(query, [
      updateDto.number,
      updateDto.is_active,
      updateDto.last_verified_at,
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