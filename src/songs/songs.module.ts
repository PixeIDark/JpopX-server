import { forwardRef, Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { SearchModule } from '../search/search.module';
import { DatabaseModule } from '../database/database.module';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [DatabaseModule, SearchModule, forwardRef(() => ArtistsModule)],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {
}
