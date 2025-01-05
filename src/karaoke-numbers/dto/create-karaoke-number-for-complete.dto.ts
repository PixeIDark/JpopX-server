import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateKaraokeNumberForCompleteDto {
  @ApiPropertyOptional({ description: 'TJ 노래방 번호' })
  @IsOptional()
  @IsString()
  tj_number?: string;

  @ApiPropertyOptional({ description: '금영 노래방 번호' })
  @IsOptional()
  @IsString()
  kumyoung_number?: string;
}