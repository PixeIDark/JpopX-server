import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateKaraokeNumberDto {
  @ApiProperty({ description: '노래 ID' })
  @IsNumber()
  song_id: number;

  @ApiPropertyOptional({ description: 'TJ 노래방 번호' })
  @IsOptional()
  @IsString()
  tk_number?: string;

  @ApiPropertyOptional({ description: '금영 노래방 번호' })
  @IsOptional()
  @IsString()
  kumyoung_number?: string;
}