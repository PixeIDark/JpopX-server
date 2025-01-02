import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateLyricsDto {
  @ApiProperty({ description: '노래 ID' })
  @IsNumber()
  song_id: number;

  @ApiProperty({ description: '가사 텍스트' })
  @IsString()
  lyrics_text: string;
}