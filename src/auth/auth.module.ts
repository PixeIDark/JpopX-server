import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RefreshTokenController } from './refresh-token/refresh-token.controller';
import { RefreshTokenService } from './refresh-token/refresh-token.service';

@Module({
  imports: [
    DatabaseModule, // 여기에 DatabaseModule 추가
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, RefreshTokenController],
  providers: [AuthService, RefreshTokenService],
  exports: [AuthService],
})
export class AuthModule {
}
