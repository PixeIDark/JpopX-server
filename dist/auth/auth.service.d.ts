import { JwtService } from '@nestjs/jwt';
import { Pool } from 'mysql2/promise';
export declare class AuthService {
    private connection;
    private readonly jwtService;
    constructor(connection: Pool, jwtService: JwtService);
    signup(email: string, password: string, name: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
