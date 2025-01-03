import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({ description: '검색어' })
  @IsString()
  text: string;

  @ApiProperty({
    description: '검색 타입',
    enum: ['both', 'artist', 'title', 'lyrics'],
  })
  @IsEnum(['both', 'artist', 'title', 'lyrics'])
  searchType: 'both' | 'artist' | 'title' | 'lyrics';

  @ApiProperty({ description: '정렬 기준', enum: ['latest', 'popular'] })
  @IsEnum(['latest', 'popular'])
  sort: 'latest' | 'popular';

  @ApiProperty({ description: '페이지당 항목 수', required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: '페이지 번호', required: false })
  @IsNumber()
  @IsOptional()
  page?: number;
}