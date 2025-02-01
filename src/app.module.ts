import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { KakaoModule } from './oauth/kakao/kakao.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SearchModule } from './search/search.module';
import { ArtistsModule } from './artists/artists.module';
import { SongsModule } from './songs/songs.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { KaraokeNumbersModule } from './karaoke-numbers/karaoke-numbers.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    KakaoModule,
    CloudinaryModule,
    SearchModule,
    ArtistsModule,
    SongsModule,
    LyricsModule,
    KaraokeNumbersModule,
    FavoritesModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
