import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateLyricsDto {
  @ApiProperty({ description: '가사 텍스트' })
  @IsString()
  lyrics_text: string;
}