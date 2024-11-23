import { Module } from '@nestjs/common';
import { createPool } from 'mysql2/promise';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return createPool({
          host: 'localhost',
          user: 'root',
          password: configService.get('DATABASE_PASSWORD'),
          database: 'minchelin',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          dateStrings: true,
        });
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'], // DATABASE_CONNECTION을 명시적으로 export
})
export class DatabaseModule {}
