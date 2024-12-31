import { PartialType } from '@nestjs/swagger';
import { CreateLyricDto } from './create-lyric.dto';

export class UpdateLyricDto extends PartialType(CreateLyricDto) {}
