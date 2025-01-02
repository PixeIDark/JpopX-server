import { Module } from '@nestjs/common';
import { KaraokeNumbersController } from './karaoke-numbers.controller';
import { KaraokeNumbersService } from './karaoke-numbers.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KaraokeNumbersController],
  providers: [KaraokeNumbersService],
  exports: [KaraokeNumbersService],
})
export class KaraokeNumbersModule {
}