import { Injectable, Inject } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { JwtService } from '@nestjs/jwt';
import { KakaoUserDto } from './dto/kakao-user.dto';

@Injectable()
export class KakaoService {
  constructor(
    @Inject('DATABASE_CONNECTION') private connection: Pool,
    private readonly jwtService: JwtService,
  ) {
  }

  async saveKakaoUser(kakaoUserDto: KakaoUserDto) {
    const [existingUsers] = await this.connection.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE kakao_id = ? AND deleted_at IS NULL',
      [kakaoUserDto.providerAccountId],
    );

    let userId;

    if (!existingUsers[0]) {
      const [result] = await this.connection.execute<ResultSetHeader>(
        'INSERT INTO users (name, kakao_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [kakaoUserDto.name, kakaoUserDto.providerAccountId],
      );
      userId = result.insertId;
    } else {
      userId = existingUsers[0].id;
      await this.connection.execute(
        'UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?',
        [kakaoUserDto.name, userId],
      );
    }

    const accessToken = this.jwtService.sign(
      { userId, provider: 'kakao' },
      { expiresIn: '30m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId, provider: 'kakao' },
      { expiresIn: '7d' },
    );

    await this.connection.execute(
      'UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?',
      [accessToken, refreshToken, userId],
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        name: kakaoUserDto.name,
      },
    };
  }
}