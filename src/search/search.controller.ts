import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  @Get()
  @ApiOperation({ summary: '통합 검색' })
  async search(
    @Query('text') text: string,
    @Query('lang') lang: 'ko' | 'ja' | 'en',
    @Query('searchType') searchType: 'both' | 'artist' | 'title' | 'lyrics',
    @Query('sort') sort: 'latest' | 'popular',
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const query = `
      SELECT 
        s.*, 
        a.name_ko as artist_name_ko,
        a.name_ja as artist_name_ja,
        a.name_en as artist_name_en,
        l.lyrics_text
      FROM search_index si
      LEFT JOIN songs s ON si.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN lyrics l ON s.id = l.song_id
      WHERE CASE :lang
        WHEN 'ja' THEN 
          si.title_ja LIKE CONCAT('%', :text, '%') OR 
          si.artist_ja LIKE CONCAT('%', :text, '%')
          ${searchType === 'lyrics' ? 'OR l.lyrics_text LIKE CONCAT("%", :text, "%")' : ''}
        WHEN 'ko' THEN 
          si.title_ko LIKE CONCAT('%', :text, '%') OR 
          si.artist_ko LIKE CONCAT('%', :text, '%')
          ${searchType === 'lyrics' ? 'OR si.romanized_ko LIKE CONCAT("%", :text, "%")' : ''}
        ELSE 
          si.title_en LIKE CONCAT('%', :text, '%') OR 
          si.artist_en LIKE CONCAT('%', :text, '%')
      END
      ${searchType === 'artist' ? 'AND si.artist_ko IS NOT NULL' : ''}
      ${searchType === 'title' ? 'AND si.title_ko IS NOT NULL' : ''}
      ORDER BY ${sort === 'popular' ? 's.popularity_score DESC' : 's.created_at DESC'}
      LIMIT :limit OFFSET :offset
    `;

    return {
      items: [],
      total: 0,
      page,
      limit,
    };
  }
}