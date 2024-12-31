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
      const searchPattern = `%${text}%`;

      let whereClause = '';
      const params = [];

      // 언어별 검색 조건
      if (lang === 'ko') {
        whereClause = '(si.title_ko LIKE ? OR si.artist_ko LIKE ?)';
        params.push(searchPattern, searchPattern);
      } else if (lang === 'ja') {
        whereClause = '(si.title_ja LIKE ? OR si.artist_ja LIKE ?)';
        params.push(searchPattern, searchPattern);
      } else {
        whereClause = '(si.title_en LIKE ? OR si.artist_en LIKE ?)';
        params.push(searchPattern, searchPattern);
      }

      // 검색 타입 조건 추가
      if (searchType === 'artist') {
        whereClause += ' AND si.artist_ko IS NOT NULL';
      } else if (searchType === 'title') {
        whereClause += ' AND si.title_ko IS NOT NULL';
      } else if (searchType === 'lyrics' && lang === 'ja') {
        whereClause += ' OR si.romanized_ko LIKE ?';
        params.push(searchPattern);
      }

      // 정렬 및 페이지네이션 파라미터 추가
      params.push(limit, offset);

      const query = `
        SELECT 
          s.*,
          si.artist_ko,
          si.artist_ja,
          si.artist_en,
          si.romanized_ko
        FROM search_index si
        INNER JOIN songs s ON si.song_id = s.id
        WHERE ${whereClause}
        ORDER BY ${sort === 'popular' ? 's.popularity_score' : 's.created_at'} DESC
        LIMIT ? OFFSET ?
      `;

      console.log('Query:', query);
      console.log('Params:', params);

      const [rows] = await this.connection.execute(query, params);

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM search_index si
        WHERE ${whereClause}
      `;

      const [countRows] = await this.connection.execute(
        countQuery,
        params.slice(0, -2),  // 마지막 limit, offset 제외
      );

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

  async updateSearchIndex(songId: number, songData: any, artistData: any, lyricsText?: string) {
    const query = `
      INSERT INTO search_index 
        (song_id, title_ko, title_ja, title_en, artist_ko, artist_ja, artist_en, romanized_ko)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title_ko = VALUES(title_ko),
        title_ja = VALUES(title_ja),
        title_en = VALUES(title_en),
        artist_ko = VALUES(artist_ko),
        artist_ja = VALUES(artist_ja),
        artist_en = VALUES(artist_en),
        romanized_ko = VALUES(romanized_ko)
    `;

    await this.connection.execute(query, [
      songId,
      songData.title_ko,
      songData.title_ja,
      songData.title_en,
      artistData.name_ko,
      artistData.name_ja,
      artistData.name_en,
      lyricsText ? this.convertToRomanizedKo(lyricsText) : null,
    ]);
  }

  private convertToRomanizedKo(lyricsText: string): string {
    // 일본어 가사를 한글 발음으로 변환하는 로직
    // 실제 구현은 별도 라이브러리나 매핑 테이블을 사용해야 함
    return lyricsText;
  }
}