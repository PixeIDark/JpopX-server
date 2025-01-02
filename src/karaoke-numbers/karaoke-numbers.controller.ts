import { Controller, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KaraokeNumbersService } from './karaoke-numbers.service';
import { CreateKaraokeNumberDto } from './dto/create-karaoke-number.dto';
import { UpdateKaraokeNumberDto } from './dto/update-karaoke-number.dto';

@ApiTags('karaoke-numbers')
@Controller('karaoke-numbers')
export class KaraokeNumbersController {
  constructor(
    private readonly karaokeNumbersService: KaraokeNumbersService,
  ) {
  }

  @Post()
  @ApiOperation({ summary: '노래방 번호 생성' })
  async create(@Body() createDto: CreateKaraokeNumberDto) {
    return await this.karaokeNumbersService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '노래방 번호 수정' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateKaraokeNumberDto,
  ) {
    return await this.karaokeNumbersService.update(id, updateDto);
  }
}