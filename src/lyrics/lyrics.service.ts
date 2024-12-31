import { Injectable } from '@nestjs/common';
import { CreateLyricDto } from './dto/create-lyric.dto';
import { UpdateLyricDto } from './dto/update-lyric.dto';

@Injectable()
export class LyricsService {
  create(createLyricDto: CreateLyricDto) {
    return 'This action adds a new lyric';
  }

  findAll() {
    return `This action returns all lyrics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lyric`;
  }

  update(id: number, updateLyricDto: UpdateLyricDto) {
    return `This action updates a #${id} lyric`;
  }

  remove(id: number) {
    return `This action removes a #${id} lyric`;
  }
}
