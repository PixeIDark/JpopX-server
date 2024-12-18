import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { Inject } from '@nestjs/common';

@Injectable()
export class RecipeOwnerGuard implements CanActivate {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Pool,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const recipeId = +request.params.id;

    const [recipes] = await this.connection.query(
      'SELECT user_id FROM recipes WHERE id = ?',
      [recipeId],
    );

    if (!recipes[0]) {
      throw new NotFoundException('레시피를 찾을 수 없습니다.');
    }

    if (recipes[0].user_id !== userId) {
      throw new ForbiddenException('해당 레시피를 수정/삭제할 권한이 없습니다.');
    }

    return true;
  }
}