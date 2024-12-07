import { Controller, Post, Body } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoLoginDto } from './dto/kakao.dto';

@Controller('oauth/callback/kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {
  }

  @Post()
  async kakaoCallback(@Body() kakaoLoginDto: KakaoLoginDto) {
    return this.kakaoService.kakaoLogin(kakaoLoginDto);
  }
}