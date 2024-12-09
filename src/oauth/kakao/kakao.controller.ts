import { Controller, Post, Body } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoUserDto } from './dto/kakao-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('oauth/kakao')
@Controller('oauth/kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {
  }

  @Post('user')
  @ApiOperation({ summary: '카카오 유저 정보 저장' })
  @ApiResponse({ status: 201, description: '저장 성공' })
  async saveKakaoUser(@Body() kakaoUserDto: KakaoUserDto) {
    return this.kakaoService.saveKakaoUser(kakaoUserDto);
  }
}