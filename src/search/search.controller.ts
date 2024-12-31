import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {
  }

  @Get()
  @ApiOperation({ summary: '통합 검색' })
  async search(
    @Query('text') text: string,
    @Query('lang') lang: 'ko' | 'ja' | 'en',
    @Query('searchType') searchType: 'both' | 'artist' | 'title' | 'lyrics',
    @Query('sort') sort: 'latest' | 'popular',
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
  ) {
    return this.searchService.search(text, lang, searchType, sort, limit, page);
  }
}