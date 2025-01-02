import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateKaraokeNumberDto {
  @ApiPropertyOptional({ description: '노래방 번호' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: '사용 가능 여부' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}