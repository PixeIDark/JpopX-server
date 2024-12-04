import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: '123',
    description: 'User ID',
  })
  userId: number;
}