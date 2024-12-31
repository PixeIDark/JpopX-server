import { forwardRef, Module } from '@nestjs/common';
import { LyricsService } from './lyrics.service';
import { LyricsController } from './lyrics.controller';
import { SearchModule } from '../search/search.module';
import { DatabaseModule } from '../database/database.module';
import { ArtistsModule } from '../artists/artists.module';
import { SongsModule } from '../songs/songs.module';

@Module({
  imports: [DatabaseModule, SearchModule, forwardRef(() => SongsModule),
    forwardRef(() => ArtistsModule)],
  controllers: [LyricsController],
  providers: [LyricsService],
  exports: [LyricsService],
})
export class LyricsModule {
}
