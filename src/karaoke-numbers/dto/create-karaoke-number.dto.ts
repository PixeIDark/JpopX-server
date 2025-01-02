import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({ description: '번호 유효성 최종 확인 일자' })
  @IsDate()
  @IsOptional()
  last_verified_at?: Date;
}