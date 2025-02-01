import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {
}