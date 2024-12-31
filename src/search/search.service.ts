import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mysql2/promise';

@Injectable()
export class SearchService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
  }

  async search(
    text: string,
    lang: 'ko' | 'ja' | 'en',
    searchType: 'both' | 'artist' | 'title' | 'lyrics',
    sort: 'latest' | 'popular',
    limit: number = 20,
    page: number = 1,
  ) {
    try {
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
        WHERE 
          CASE '${lang}'
            WHEN 'ja' THEN 
              (si.title_ja LIKE ? OR si.artist_ja LIKE ?)
              ${searchType === 'lyrics' ? 'OR si.romanized_ko LIKE ?' : ''}
            WHEN 'ko' THEN 
              (si.title_ko LIKE ? OR si.artist_ko LIKE ?)
              ${searchType === 'lyrics' ? 'OR si.romanized_ko LIKE ?' : ''}
            ELSE 
              (si.title_en LIKE ? OR si.artist_en LIKE ?)
          END
        ${searchType === 'artist' ? 'AND si.artist_ko IS NOT NULL' : ''}
        ${searchType === 'title' ? 'AND si.title_ko IS NOT NULL' : ''}
        ORDER BY ${sort === 'popular' ? 's.popularity_score' : 's.created_at'} DESC
        LIMIT ? OFFSET ?
      `;

      const searchPattern = `%${text}%`;
      const params = [
        searchPattern, // title
        searchPattern, // artist
        ...(searchType === 'lyrics' ? [searchPattern] : []), // lyrics
        limit,
        offset,
      ];

      const [rows] = await this.connection.execute(query, params);

      const countQuery = `
        SELECT COUNT(*) as total
        FROM search_index si
        WHERE 
          CASE '${lang}'
            WHEN 'ja' THEN (si.title_ja LIKE ? OR si.artist_ja LIKE ?)
            WHEN 'ko' THEN (si.title_ko LIKE ? OR si.artist_ko LIKE ?)
            ELSE (si.title_en LIKE ? OR si.artist_en LIKE ?)
          END
        ${searchType === 'artist' ? 'AND si.artist_ko IS NOT NULL' : ''}
        ${searchType === 'title' ? 'AND si.title_ko IS NOT NULL' : ''}
      `;

      const [countRows] = await this.connection.execute(countQuery, [
        searchPattern,
        searchPattern,
      ]);

      return {
        items: rows,
        total: countRows[0].total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private convertToRomanizedKo(lyricsText: string): string {
    // 일본어 가사를 한글 발음으로 변환하는 로직
    // 실제 구현은 별도 라이브러리나 매핑 테이블을 사용해야 함
    return lyricsText;
  }
}