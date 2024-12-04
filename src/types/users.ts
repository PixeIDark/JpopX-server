import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string;
  access_token: string | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}