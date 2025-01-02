import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { CreateSongDto } from './create-song.dto';
import { CreateKaraokeNumberDto } from '../../karaoke-numbers/dto/create-karaoke-number.dto';
import { CreateLyricsDto } from '../../lyrics/dto/create-lyric.dto';

export class CreateSongCompleteDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateSongDto)
  song: CreateSongDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLyricsDto)
  lyrics?: Omit<CreateLyricsDto, 'song_id'>;  // song_id는 서비스에서 자동으로 넣어줄거라 제외

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateKaraokeNumberDto)
  karaokeNumbers?: Omit<CreateKaraokeNumberDto, 'song_id'>[];  // song_id는 서비스에서 자동으로 넣어줄거라 제외
}