import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class CreateKaraokeNumberForCompleteDto {
  @ApiProperty({ description: '노래방 브랜드', enum: ['kumyoung', 'tj'] })
  @IsEnum(['kumyoung', 'tj'])
  brand: 'kumyoung' | 'tj';

  @ApiProperty({ description: '노래방 번호' })
  @IsString()
  number: string;
}