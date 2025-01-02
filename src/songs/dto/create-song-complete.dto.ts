import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { CreateSongDto } from './create-song.dto';
import { CreateLyricsForCompleteDto } from '../../lyrics/dto/create-lyrics-for-complete.dto';
import { CreateKaraokeNumberForCompleteDto } from '../../karaoke-numbers/dto/create-karaoke-number-for-complete.dto';

export class CreateSongCompleteDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateSongDto)
  song: CreateSongDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLyricsForCompleteDto)
  lyrics?: CreateLyricsForCompleteDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateKaraokeNumberForCompleteDto)
  karaokeNumbers?: CreateKaraokeNumberForCompleteDto[];
}