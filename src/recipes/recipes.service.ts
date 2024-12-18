import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { User } from '../types/users';
import { Recipe } from '../types/recipe';
import { RowDataPacket } from 'mysql2';

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

  async findAll({ page, limit, category }: { page: number; limit: number; category?: number }) {
    let query = `
    SELECT r.*, u.name as author_name, c.name as category_name,
    COUNT(*) OVER() as total_count
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    JOIN recipe_categories rc ON r.id = rc.recipe_id
    JOIN categories c ON rc.category_id = c.id
  `;

    const params = [];
    if (category) {
      query += ' WHERE rc.category_id = ?';
      params.push(category);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [recipes] = await this.connection.query<Recipe[]>(query, params);

    const total = recipes[0]?.total_count || 0;

    return {
      data: recipes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const [recipes] = await this.connection.query<Recipe[]>(
      `SELECT r.*, u.name as author_name, c.name as category_name
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

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const conn = await this.connection.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Update recipe
      if (Object.keys(updateRecipeDto).length > 0) {
        const updateFields = [];
        const updateValues = [];

        if (updateRecipeDto.title) {
          updateFields.push('title = ?');
          updateValues.push(updateRecipeDto.title);
        }
        if (updateRecipeDto.description) {
          updateFields.push('description = ?');
          updateValues.push(updateRecipeDto.description);
        }
        if (updateRecipeDto.cooking_time) {
          updateFields.push('cooking_time = ?');
          updateValues.push(updateRecipeDto.cooking_time);
        }
        if (updateRecipeDto.difficulty) {
          updateFields.push('difficulty = ?');
          updateValues.push(updateRecipeDto.difficulty);
        }
        if (updateRecipeDto.thumbnail_url) {
          updateFields.push('thumbnail_url = ?');
          updateValues.push(updateRecipeDto.thumbnail_url);
        }

        if (updateFields.length > 0) {
          await conn.query(
            `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ?`,
            [...updateValues, id],
          );
        }
      }

      // 2. Update category if provided
      if (updateRecipeDto.category_id) {
        await conn.query(
          'UPDATE recipe_categories SET category_id = ? WHERE recipe_id = ?',
          [updateRecipeDto.category_id, id],
        );
      }

      // 3. Update ingredients if provided
      if (updateRecipeDto.ingredients) {
        await conn.query(
          'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
          [id],
        );

        const ingredientValues = updateRecipeDto.ingredients.map(ingredient =>
          [id, ingredient.ingredient_name, ingredient.amount],
        );

        if (ingredientValues.length > 0) {
          await conn.query(
            `INSERT INTO recipe_ingredients 
           (recipe_id, ingredient_name, amount) 
           VALUES ?`,
            [ingredientValues],
          );
        }
      }

      // 4. Update steps if provided
      if (updateRecipeDto.steps) {
        await conn.query(
          'DELETE FROM recipe_steps WHERE recipe_id = ?',
          [id],
        );

        const stepValues = updateRecipeDto.steps.map(step =>
          [id, step.step_number, step.description, step.image_url],
        );

        if (stepValues.length > 0) {
          await conn.query(
            `INSERT INTO recipe_steps 
           (recipe_id, step_number, description, image_url) 
           VALUES ?`,
            [stepValues],
          );
        }
      }

      await conn.commit();
      return { message: '레시피가 성공적으로 수정되었습니다.' };

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async remove(id: number) {
    const conn = await this.connection.getConnection();
    try {
      await conn.beginTransaction();

      // Delete from recipe_categories
      await conn.query(
        'DELETE FROM recipe_categories WHERE recipe_id = ?',
        [id],
      );

      // Delete from recipe_ingredients
      await conn.query(
        'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
        [id],
      );

      // Delete from recipe_steps
      await conn.query(
        'DELETE FROM recipe_steps WHERE recipe_id = ?',
        [id],
      );

      // Finally delete the recipe
      await conn.query(
        'DELETE FROM recipes WHERE id = ?',
        [id],
      );

      await conn.commit();
      return { message: '레시피가 성공적으로 삭제되었습니다.' };

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
