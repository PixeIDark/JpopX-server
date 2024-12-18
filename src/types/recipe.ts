import { RowDataPacket } from 'mysql2';

export interface Recipe extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  cooking_time: number;
  difficulty: string;
  created_at: Date;
  updated_at: Date;
  thumbnail_url: string | null;
  author_name?: string;
  category_name?: string;
}

export interface RecipeIngredient extends RowDataPacket {
  id: number;
  recipe_id: number;
  ingredient_name: string;
  amount: string;
}

export interface RecipeStep extends RowDataPacket {
  id: number;
  recipe_id: number;
  step_number: number;
  description: string;
  image_url: string | null;
}