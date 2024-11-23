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
          host: configService.get('DATABASE_HOST'),
          port: configService.get('DATABASE_PORT'),
          user: 'root',
          password: configService.get('DATABASE_PASSWORD'),
          database: 'minchelin',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
