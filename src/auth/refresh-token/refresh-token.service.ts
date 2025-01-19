import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mysql2/promise';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
    private readonly jwtService: JwtService,
  ) {
  }

  async refreshToken(refreshToken: string) {
    // 1. Verify refresh token
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Check if refresh token exists in database
    const [users] = await this.connection.execute(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ? AND deleted_at IS NULL',
      [payload.userId, refreshToken],
    );

    if (!users[0]) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // 3. Generate new token pair
    const newAccessToken = this.jwtService.sign(
      { userId: payload.userId, email: payload.email },
      { expiresIn: '30m' },
    );

    const newRefreshToken = this.jwtService.sign(
      { userId: payload.userId, email: payload.email },
      { expiresIn: '7d' },
    );

    // 4. Update tokens in database
    await this.connection.execute(
      'UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?',
      [newAccessToken, newRefreshToken, payload.userId],
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}