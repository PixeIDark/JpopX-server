import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteSongDto } from './create-favorite-song.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateFavoriteDto extends PartialType(CreateFavoriteSongDto) {
  @ApiPropertyOptional({ description: '즐겨찾기 목록 이름' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '즐겨찾기 목록 이미지 URL' })
  @IsString()
  @IsOptional()
  image_url?: string;
}
