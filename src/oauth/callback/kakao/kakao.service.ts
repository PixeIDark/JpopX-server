import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';  // OkPacket 대신 ResultSetHeader
import { KakaoLoginDto } from './dto/kakao.dto';
import { JwtService } from '@nestjs/jwt';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  kakao_id: string;
}

@Injectable()
export class KakaoService {
  constructor(
    @Inject('DATABASE_CONNECTION') private connection: Pool,
    private readonly jwtService: JwtService,
  ) {
  }

  async kakaoLogin(kakaoLoginDto: KakaoLoginDto) {
    try {
      const tokenResponse = await fetch(
        'https://kauth.kakao.com/oauth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code: kakaoLoginDto.code,
          }),
        },
      );

      if (!tokenResponse.ok) {
        throw new UnauthorizedException('Failed to get Kakao token');
      }

      const tokenData = await tokenResponse.json();
      const { access_token } = tokenData;

      const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new UnauthorizedException('Failed to get Kakao user info');
      }

      const userData = await userResponse.json();
      const { id: kakaoId, kakao_account } = userData;

      const [existingUsers] = await this.connection.execute<UserRow[]>(
        'SELECT * FROM users WHERE kakao_id = ? AND deleted_at IS NULL',
        [kakaoId],
      );

      let user;

      if (existingUsers.length === 0) {
        const [result] = await this.connection.execute<ResultSetHeader>(  // OkPacket 대신 ResultSetHeader 사용
          'INSERT INTO users (email, name, kakao_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [kakao_account.email, kakao_account.profile.nickname, kakaoId],
        );

        user = {
          id: result.insertId,
          email: kakao_account.email,
          name: kakao_account.profile.nickname,
        };
      } else {
        user = existingUsers[0];
      }

      const accessToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '30m' },
      );

      const refreshToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' },
      );

      await this.connection.execute(
        'UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?',
        [accessToken, refreshToken, user.id],
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Kakao login error:', error);
      throw error;
    }
  }
}