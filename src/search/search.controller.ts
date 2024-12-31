import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Connection } from 'mysql2/promise';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: Connection,
  ) {
  }

  @Get()
  @ApiOperation({ summary: '통합 검색' })
  async search(
    @Query('text') text: string,
    @Query('lang') lang: 'ko' | 'ja' | 'en',
    @Query('searchType') searchType: 'both' | 'artist' | 'title' | 'lyrics',
    @Query('sort') sort: 'latest' | 'popular',
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
  ) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        s.*,
        si.artist_ko,
        si.artist_ja,
        si.artist_en,
        si.romanized_ko
      FROM search_index si
      INNER JOIN songs s ON si.song_id = s.id
      WHERE CASE ?
        WHEN 'ja' THEN 
          si.title_ja LIKE CONCAT('%', ?, '%') OR 
          si.artist_ja LIKE CONCAT('%', ?, '%')
          ${searchType === 'lyrics' ? 'OR si.romanized_ko LIKE CONCAT("%", ?, "%")' : ''}
        WHEN 'ko' THEN 
          si.title_ko LIKE CONCAT('%', ?, '%') OR 
          si.artist_ko LIKE CONCAT('%', ?, '%')
          ${searchType === 'lyrics' ? 'OR si.romanized_ko LIKE CONCAT("%", ?, "%")' : ''}
        ELSE 
          si.title_en LIKE CONCAT('%', ?, '%') OR 
          si.artist_en LIKE CONCAT('%', ?, '%')
      END
      ${searchType === 'artist' ? 'AND si.artist_ko IS NOT NULL' : ''}
      ${searchType === 'title' ? 'AND si.title_ko IS NOT NULL' : ''}
      ORDER BY ${sort === 'popular' ? 's.popularity_score' : 's.created_at'} DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.connection.execute(query, [
      lang,
      text,
      text,
      ...(searchType === 'lyrics' ? [text] : []),
      limit,
      offset,
    ]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM search_index si
      WHERE CASE ?
        WHEN 'ja' THEN si.title_ja LIKE CONCAT('%', ?, '%') OR si.artist_ja LIKE CONCAT('%', ?, '%')
        WHEN 'ko' THEN si.title_ko LIKE CONCAT('%', ?, '%') OR si.artist_ko LIKE CONCAT('%', ?, '%')
        ELSE si.title_en LIKE CONCAT('%', ?, '%') OR si.artist_en LIKE CONCAT('%', ?, '%')
      END
      ${searchType === 'artist' ? 'AND si.artist_ko IS NOT NULL' : ''}
      ${searchType === 'title' ? 'AND si.title_ko IS NOT NULL' : ''}
    `;

    const [countRows] = await this.connection.execute(countQuery, [
      lang,
      text,
      text,
    ]);

    return {
      items: rows,
      total: countRows[0].total,
      page,
      limit,
    };
  }
}