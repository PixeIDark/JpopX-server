export class CreateFavoriteSongDto {
  list_id: number;
  song_id: number;
  title_ko: string;
  title_ja?: string;
  title_en?: string;
  artist_ko?: string;
  artist_ja?: string;
  artist_en?: string;
  thumbnail_url?: string;
  tj_number?: string;
  kumyoung_number?: string;
}