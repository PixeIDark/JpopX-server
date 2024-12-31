import { forwardRef, Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { SearchModule } from '../search/search.module';
import { DatabaseModule } from '../database/database.module';
import { SongsModule } from '../songs/songs.module';

@Module({
  imports: [
    DatabaseModule,
    SearchModule,
    forwardRef(() => SongsModule),
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {
}