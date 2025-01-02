import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateKaraokeNumberDto {
  @ApiProperty({ description: '노래 ID' })
  @IsNumber()
  song_id: number;

  @ApiProperty({ description: '노래방 브랜드', enum: ['kumyoung', 'tj'] })
  @IsEnum(['kumyoung', 'tj'])
  brand: 'kumyoung' | 'tj';

  @ApiProperty({ description: '노래방 번호' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ description: '사용 가능 여부' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}