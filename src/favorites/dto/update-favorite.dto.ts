import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteSongDto } from './create-favorite-song.dto';

export class UpdateFavoriteDto extends PartialType(CreateFavoriteSongDto) {
}
