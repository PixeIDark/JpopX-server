import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'd@d.com',
    description: 'User email',
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요' })
  email: string;

  @ApiProperty({
    example: '12341234',
    description: 'User password - minimum 8 characters',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  password: string;

  @ApiProperty({
    example: '강건마',
    description: 'User name',
  })
  @IsString({ message: '이름을 입력해주세요' })
  name: string;
}
