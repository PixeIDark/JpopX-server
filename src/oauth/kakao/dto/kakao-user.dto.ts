import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class KakaoUserDto {
  @ApiProperty({
    example: '3824356418',
    description: 'Kakao provider account ID',
  })
  @IsString()
  providerAccountId: string;

  @ApiProperty({
    example: '강철민',
    description: 'User name from Kakao',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Kakao access token',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Kakao refresh token',
  })
  @IsString()
  refreshToken: string;
}