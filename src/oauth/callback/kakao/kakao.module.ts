import { Module } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoController } from './kakao.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../../database/database.module';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [KakaoController],
  providers: [KakaoService],
})
export class KakaoModule {
}