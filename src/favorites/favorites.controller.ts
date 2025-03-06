import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('lists')
  @ApiOperation({ summary: '즐겨찾기 목록 조회' })
  async getFavoriteLists(@Req() req: Request) {
    return this.favoritesService.getFavoriteLists(req.user.userId);
  }

  @Get('lists/:listId/songs')
  @ApiOperation({ summary: '특정 즐겨찾기 목록의 곡 목록 조회' })
  async getFavoriteListSongs(
    @Req() req: Request,
    @Param('listId') listId: string,
  ) {
    return this.favoritesService.getFavoriteListSongs(
      req.user.userId,
      parseInt(listId),
    );
  }

  @Put('lists/reorder')
  @ApiOperation({ summary: '즐겨찾기 목록 순서 변경' })
  async reorderList(
    @Req() req: Request,
    @Body() data: { listId: number; newOrder: number },
  ) {
    return this.favoritesService.reorderList(
      req.user.userId,
      data.listId,
      data.newOrder,
    );
  }

  @Post('lists')
  @ApiOperation({ summary: '즐겨찾기 목록 생성' })
  async createFavoriteList(
    @Req() req: Request,
    @Body() data: { name: string },
  ) {
    return this.favoritesService.createFavoriteList(req.user.userId, data.name);
  }

  @Put('lists/:listId')
  @ApiOperation({ summary: '즐겨찾기 목록 수정' })
  async updateFavoriteList(
    @Req() req: Request,
    @Param('listId') listId: string,
    @Body() data: { name?: string; image_url?: string },
  ) {
    return this.favoritesService.updateFavoriteList(
      req.user.userId,
      parseInt(listId),
      data,
    );
  }

  @Delete('lists/:listId')
  @ApiOperation({ summary: '즐겨찾기 목록 삭제' })
  async deleteFavoriteList(
    @Req() req: Request,
    @Param('listId') listId: string,
  ) {
    return this.favoritesService.deleteFavoriteList(
      req.user.userId,
      parseInt(listId),
    );
  }

  @Post('lists/:listId/songs')
  @ApiOperation({ summary: '즐겨찾기 목록에 곡 추가' })
  async addSongToList(
    @Req() req: Request,
    @Param('listId') listId: string,
    @Body() data: { songId: number },
  ) {
    return this.favoritesService.addSongToList(
      req.user.userId,
      parseInt(listId),
      data.songId,
    );
  }

  @Delete('songs/:favoriteId')
  @ApiOperation({ summary: '즐겨찾기에서 곡 제거' })
  async removeSongFromList(
    @Req() req: Request,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.favoritesService.removeSongFromList(
      req.user.userId,
      parseInt(favoriteId),
    );
  }

  @Put('songs/reorder')
  @ApiOperation({ summary: '즐겨찾기 곡 순서 변경' })
  async reorderSong(
    @Req() req: Request,
    @Body() data: { favoriteId: number; newOrder: number },
  ) {
    return this.favoritesService.reorderSong(
      req.user.userId,
      data.favoriteId,
      data.newOrder,
    );
  }
}
