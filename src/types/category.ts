import { RowDataPacket } from 'mysql2';
import { ApiProperty } from '@nestjs/swagger';

export interface Category extends RowDataPacket {
  id: number;
  name: string;
}
