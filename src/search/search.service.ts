import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mysql2/promise';

@Injectable()
export class SearchService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {
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