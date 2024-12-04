declare module 'express' {
  import { User } from './users';

  export interface Request {
    user: User;
  }
}