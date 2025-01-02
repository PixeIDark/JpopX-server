import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';

export class UpdateKaraokeNumberDto {
  @ApiPropertyOptional({ description: '노래방 번호' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: '사용 가능 여부' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: '번호 유효성 최종 확인 일자' })
  @IsDate()
  @IsOptional()
  last_verified_at?: Date;
}