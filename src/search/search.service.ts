import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mysql2/promise';

@Injectable()
export class SearchService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {}

  async search(
    text: string,
    searchType: 'both' | 'artist' | 'title' | 'lyrics',
    sort: 'latest' | 'popular',
    limit: number = 20,
    page: number = 1,
  ) {
    try {
      // 명시적으로 숫자 타입으로 변환
      const numericLimit = Number(limit);
      const numericPage = Number(page);
      const offset = (numericPage - 1) * numericLimit;

      const searchPattern = `%${text}%`;
      const params = [];

      // 검색 타입별 WHERE 절 구성
      let whereClause = '';
      if (searchType === 'artist') {
        whereClause =
          '(si.artist_ko LIKE ? OR si.artist_ja LIKE ? OR si.artist_en LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      } else if (searchType === 'title') {
        whereClause =
          '(si.title_ko LIKE ? OR si.title_ja LIKE ? OR si.title_en LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      } else if (searchType === 'lyrics') {
        whereClause = 'si.romanized_ko LIKE ?';
        params.push(searchPattern);
      } else {
        // both - 모든 언어의 제목과 아티스트 검색
        whereClause = `(
        si.title_ko LIKE ? OR si.title_ja LIKE ? OR si.title_en LIKE ? OR 
        si.artist_ko LIKE ? OR si.artist_ja LIKE ? OR si.artist_en LIKE ?
      )`;
        params.push(
          searchPattern,
          searchPattern,
          searchPattern, // title
          searchPattern,
          searchPattern,
          searchPattern, // artist
        );
      }

      // execute 대신 query 메서드 사용
      params.push(numericLimit, offset);

      console.log('Query Params:', params);

      const query = `
          SELECT
              si.id,
              si.song_id,
              s.title_ko,
              s.title_ja,
              s.title_en,
              s.artist_id,
              s.release_date,
              s.thumbnail_url,
              s.popularity_score,
              s.created_at,
              s.updated_at,
              si.artist_ko,
              si.artist_ja,
              si.artist_en,
              si.romanized_ko,
              kn.tj_number,
              kn.kumyoung_number
          FROM search_index si
                   INNER JOIN songs s ON si.song_id = s.id
                   LEFT JOIN karaoke_numbers kn ON s.id = kn.song_id
          WHERE ${whereClause}
          ORDER BY ${sort === 'popular' ? 's.popularity_score' : 's.release_date'} DESC
              LIMIT ? OFFSET ?
      `;

      // execute 대신 query 사용
      const [rows] = await this.connection.query(query, params);

      // 전체 개수 쿼리
      const countQuery = `
          SELECT COUNT(*) as total
          FROM search_index si
          WHERE ${whereClause}
      `;

      // 여기도 query 사용
      const [countRows] = await this.connection.query(
        countQuery,
        params.slice(0, -2), // limit, offset 제외
      );

      return {
        items: rows,
        total: countRows[0].total,
        page: numericPage,
        limit: numericLimit,
      };
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      throw error;
    }
  }

  async updateSearchIndex(
    songId: number,
    songData: any,
    artistData: any,
    lyricsText?: string,
  ) {
    const query = `
        INSERT INTO search_index
        (song_id, title_ko, title_ja, title_en, artist_ko, artist_ja, artist_en, romanized_ko)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                                 title_ko = VALUES(title_ko),
                                 title_ja = VALUES(title_ja),
                                 title_en = VALUES(title_en),
                                 artist_ko = VALUES(artist_ko),
                                 artist_ja = VALUES(artist_ja),
                                 artist_en = VALUES(artist_en),
                                 romanized_ko = VALUES(romanized_ko)
    `;

    try {
      const result = await this.connection.query(query, [
        songId,
        songData.title_ko,
        songData.title_ja,
        songData.title_en,
        artistData.name_ko,
        artistData.name_ja,
        artistData.name_en,
        lyricsText ? this.convertToRomanizedKo(lyricsText) : null,
      ]);
      return result;
    } catch (error) {
      console.error('검색 인덱스 업데이트 중 오류:', error);
      throw error;
    }
  }

  private convertToRomanizedKo(lyricsText: string): string {
    // 일본어 가사를 한글 발음으로 변환하는 로직
    // 실제 구현은 별도 라이브러리나 매핑 테이블을 사용해야 함
    return lyricsText;
  }

  async updateArtistInSearchIndex(songId: number, artistData: any) {
    const query = `
        UPDATE search_index
        SET
            artist_ko = ?,
            artist_ja = ?,
            artist_en = ?
        WHERE song_id = ?
    `;

    try {
      return await this.connection.query(query, [
        artistData.name_ko,
        artistData.name_ja,
        artistData.name_en,
        songId,
      ]);
    } catch (error) {
      console.error('검색 인덱스 가수 정보 업데이트 중 오류:', error);
      throw error;
    }
  }
}