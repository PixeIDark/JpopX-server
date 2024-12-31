import { Inject, Injectable } from '@nestjs/common';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';  // ResultSetHeader 추가

@Injectable()
export class ArtistsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
  }

  async create(createArtistDto: {
    name_ko: string;
    name_ja?: string;
    name_en?: string;
    profile_image_url?: string;
    is_group?: boolean;
  }) {
    const query = `
      INSERT INTO artists 
        (name_ko, name_ja, name_en, profile_image_url, is_group)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.connection.execute<ResultSetHeader>(query, [
      createArtistDto.name_ko,
      createArtistDto.name_ja,
      createArtistDto.name_en,
      createArtistDto.profile_image_url,
      createArtistDto.is_group,
    ]);

    return { id: result.insertId, ...createArtistDto };
  }

  async findAll() {
    const [rows] = await this.connection.query<RowDataPacket[]>('SELECT * FROM artists');
    return rows;
  }

  async findOne(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      'SELECT * FROM artists WHERE id = ?',
      [numericId],
    );
    return rows[0];
  }

  async update(id: string | number, updateArtistDto: {  // string도 받을 수 있게 수정
    name_ko?: string;
    name_ja?: string;
    name_en?: string;
    profile_image_url?: string;
    is_group?: boolean;
  }) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const query = `
      UPDATE artists
      SET 
        name_ko = COALESCE(?, name_ko),
        name_ja = COALESCE(?, name_ja),
        name_en = COALESCE(?, name_en),
        profile_image_url = COALESCE(?, profile_image_url),
        is_group = COALESCE(?, is_group)
      WHERE id = ?
    `;

    await this.connection.execute(query, [
      updateArtistDto.name_ko,
      updateArtistDto.name_ja,
      updateArtistDto.name_en,
      updateArtistDto.profile_image_url,
      updateArtistDto.is_group,
      numericId,
    ]);

    return this.findOne(numericId);
  }

  async remove(id: string | number) {  // string도 받을 수 있게 수정
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    await this.connection.execute('DELETE FROM artists WHERE id = ?', [numericId]);
    return { id: numericId };
  }
}