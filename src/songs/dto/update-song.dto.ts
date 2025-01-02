import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateSongDto {
  @ApiPropertyOptional({ description: '한국어 제목' })
  @IsString()
  @IsOptional()
  title_ko?: string;

  @ApiPropertyOptional({ description: '일본어 제목' })
  @IsString()
  @IsOptional()
  title_ja?: string;

  @ApiPropertyOptional({ description: '영어 제목' })
  @IsString()
  @IsOptional()
  title_en?: string;

  @ApiPropertyOptional({ description: '가수 ID' })
  @IsNumber()
  @IsOptional()
  artist_id?: number;

  @ApiPropertyOptional({ description: '발매일' })
  @IsDateString()
  @IsOptional()
  release_date?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;
}