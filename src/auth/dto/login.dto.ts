import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'd@d.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12341234',
    description: 'User password',
  })
  @IsString()
  password: string;
}
