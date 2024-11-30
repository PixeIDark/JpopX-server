import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { User } from '../types/users';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_CONNECTION') private connection: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const [existingUsers] = await this.connection.execute<User[]>(
      'SELECT email FROM users WHERE email = ?',
      [email],
    );

    if (existingUsers.length > 0) {
      throw new UnauthorizedException('이미 이메일이 존재');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.connection.execute(
      'INSERT INTO users (email, password, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [email, hashedPassword, name],
    );

    return { message: '회원가입 성공' };
  }

  async login(email: string, password: string) {
    const [users] = await this.connection.execute<User[]>(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [email],
    );

    const user = users[0];
    const {id, name} = user

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
    }

    const accessToken = this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '30m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return {id, email, name, accessToken, refreshToken};
  }
}
