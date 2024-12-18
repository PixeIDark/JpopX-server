import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { KakaoModule } from './oauth/kakao/kakao.module';
import { RecipesModule } from './recipes/recipes.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    KakaoModule,
    RecipesModule,
    CategoriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
