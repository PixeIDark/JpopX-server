import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateKaraokeNumberDto {
  @ApiPropertyOptional({ description: 'TJ 노래방 번호' })
  @IsString()
  @IsOptional()
  tj_number?: string;

  @ApiPropertyOptional({ description: '금영 노래방 번호' })
  @IsString()
  @IsOptional()
  kumyoung_number?: string;
}