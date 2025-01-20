import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
  ) {
  }

  async findAll(): Promise<UserDto[]> {
    const [users] = await this.connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at, updated_at, deleted_at FROM users',
    );
    return users as UserDto[];
  }

  async findMyProfile(userId: number): Promise<UserDto> {
    const [users] = await this.connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId],
    );

    if (users.length === 0) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    return users[0] as UserDto;
  }

  async updateProfile(
    userId: number,
    updateData: {
      name?: string,
      password?: string
    },
  ): Promise<UserDto> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // 이름 업데이트
    if (updateData.name) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }

    // 비밀번호 업데이트 (해시 처리)
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    // 업데이트할 필드가 없는 경우
    if (updateFields.length === 0) {
      throw new BadRequestException('업데이트할 정보가 없습니다');
    }

    // 업데이트 쿼리 생성
    updateFields.push('updated_at = NOW()');
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND deleted_at IS NULL
    `;

    // 쿼리 실행을 위한 값 배열 완성
    updateValues.push(userId);

    // 데이터베이스 업데이트 실행
    const [result] = await this.connection.execute<ResultSetHeader>(query, updateValues);

    // 업데이트 확인
    if (result.affectedRows === 0) {
      throw new UnauthorizedException('사용자를 찾을 수 없거나 업데이트에 실패했습니다');
    }

    // 업데이트된 프로필 조회 및 반환
    return this.findMyProfile(userId);
  }

  async deleteAccount(userId: number): Promise<{ message: string }> {
    const [result] = await this.connection.execute<ResultSetHeader>(
      'UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [userId],
    );

    if (result.affectedRows === 0) {
      throw new UnauthorizedException('사용자를 찾을 수 없거나 이미 탈퇴한 계정입니다');
    }

    return { message: '회원 탈퇴가 성공적으로 처리되었습니다' };
  }
}