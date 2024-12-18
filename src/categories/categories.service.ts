// src/categories/categories.service.ts
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/respones-category.dto';
import { Category } from '../types/category';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Pool,
  ) {
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const [existing] = await this.connection.query<Category[]>(
      'SELECT id FROM categories WHERE name = ?',
      [createCategoryDto.name],
    );

    if (existing.length > 0) {
      throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
    }

    const [result] = await this.connection.query<Category[]>(
      'INSERT INTO categories (name) VALUES (?)',
      [createCategoryDto.name],
    );

    return {
      id: (result as any).insertId,
      name: createCategoryDto.name,
    };
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const [categories] = await this.connection.query<Category[]>(
      'SELECT * FROM categories ORDER BY name',
    );
    return categories;
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const [categories] = await this.connection.query<Category[]>(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );

    if (categories.length === 0) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return categories[0];
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<{ message: string }> {
    const [existing] = await this.connection.query<Category[]>(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [updateCategoryDto.name, id],
    );

    if (existing.length > 0) {
      throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
    }

    const [result] = await this.connection.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [updateCategoryDto.name, id],
    );

    if ((result as any).affectedRows === 0) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return { message: '카테고리가 성공적으로 수정되었습니다.' };
  }

  async remove(id: number) {
    const conn = await this.connection.getConnection();
    try {
      // recipe_categories 테이블에서 category_id로 확인
      const [recipes] = await conn.query<RowDataPacket[]>(
        'SELECT recipe_id FROM recipe_categories WHERE category_id = ?',
        [id],
      );

      if (recipes.length > 0) {
        throw new ConflictException('이 카테고리를 사용하는 레시피가 존재합니다.');
      }

      // 카테고리 삭제
      const [result] = await conn.query(
        'DELETE FROM categories WHERE id = ?',
        [id],
      );

      if ((result as any).affectedRows === 0) {
        throw new NotFoundException('카테고리를 찾을 수 없습니다.');
      }

      return { message: '카테고리가 성공적으로 삭제되었습니다.' };
    } finally {
      conn.release();
    }
  }
}