import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RowDataPacket } from 'mysql2';
import { User } from '../types/users';

interface Recipe extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  cooking_time: number;
  difficulty: string;
  created_at: Date;
  updated_at: Date;
  thumbnail_url: string | null;
}

@Injectable()
export class RecipesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Pool,
  ) {
  }

  async create(createRecipeDto: CreateRecipeDto, userId: number) {
    const conn = await this.connection.getConnection();
    try {
      await conn.beginTransaction();

      // 1. 사용자 존재 확인
      const [users] = await conn.query<User[]>(
        'SELECT id FROM users WHERE id = ?',
        [userId],
      );

      if (users.length === 0) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 2. Insert recipe
      const [result] = await conn.query<Recipe[]>(
        `INSERT INTO recipes 
        (user_id, title, description, cooking_time, difficulty, thumbnail_url) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          createRecipeDto.title,
          createRecipeDto.description,
          createRecipeDto.cooking_time,
          createRecipeDto.difficulty,
          createRecipeDto.thumbnail_url,
        ],
      );

      const recipeId = (result as any).insertId;

      // 3. Insert category
      await conn.query(
        `INSERT INTO recipe_categories (recipe_id, category_id) VALUES (?, ?)`,
        [recipeId, createRecipeDto.category_id],
      );

      // 4. Insert ingredients
      const ingredientValues = createRecipeDto.ingredients.map(ingredient =>
        [recipeId, ingredient.ingredient_name, ingredient.amount],
      );

      if (ingredientValues.length > 0) {
        await conn.query(
          `INSERT INTO recipe_ingredients 
          (recipe_id, ingredient_name, amount) 
          VALUES ?`,
          [ingredientValues],
        );
      }

      // 5. Insert steps
      const stepValues = createRecipeDto.steps.map(step =>
        [recipeId, step.step_number, step.description, step.image_url],
      );

      if (stepValues.length > 0) {
        await conn.query(
          `INSERT INTO recipe_steps 
          (recipe_id, step_number, description, image_url) 
          VALUES ?`,
          [stepValues],
        );
      }

      await conn.commit();
      return { id: recipeId };

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async findOne(id: number) {
    const [recipes] = await this.connection.query<Recipe[]>(
      `SELECT r.*, u.username as author_name, c.name as category_name
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       JOIN recipe_categories rc ON r.id = rc.recipe_id
       JOIN categories c ON rc.category_id = c.id
       WHERE r.id = ?`,
      [id],
    );

    if (recipes.length === 0) {
      throw new NotFoundException('레시피를 찾을 수 없습니다.');
    }

    const recipe = recipes[0];

    // Get ingredients
    const [ingredients] = await this.connection.query<RowDataPacket[]>(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
      [id],
    );

    // Get steps
    const [steps] = await this.connection.query<RowDataPacket[]>(
      'SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number',
      [id],
    );

    return {
      ...recipe,
      ingredients,
      steps,
    };
  }
}