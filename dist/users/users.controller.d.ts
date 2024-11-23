import { Pool } from 'mysql2/promise';
export declare class UsersController {
    private readonly connection;
    constructor(connection: Pool);
    findAll(): Promise<import("mysql2/promise").QueryResult>;
}
