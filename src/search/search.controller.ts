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
    @Query('searchType') searchType: 'both' | 'artist' | 'title' | 'lyrics',
    @Query('sort') sort: 'latest' | 'popular',
    @Query('limit') limit: string = '20',
    @Query('page') page: string = '1',
  ) {
    // 명시적 숫자 변환
    const numericLimit = parseInt(limit, 10) || 20;
    const numericPage = parseInt(page, 10) || 1;

    return this.searchService.search(
      text,
      searchType,
      sort,
      numericLimit,
      numericPage,
    );
  }
}