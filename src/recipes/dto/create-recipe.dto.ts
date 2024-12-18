import { IsString, IsInt, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeIngredientDto {
  @ApiProperty()
  @IsString()
  ingredient_name: string;

  @ApiProperty()
  @IsString()
  amount: string;
}

export class CreateRecipeStepDto {
  @ApiProperty()
  @IsInt()
  step_number: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class CreateRecipeDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsInt()
  cooking_time: number;

  @ApiProperty({ enum: ['삼류', '이류', '일류', '절정', '초절정', '화경', '현경', '생사경'] })
  @IsEnum(['삼류', '이류', '일류', '절정', '초절정', '화경', '현경', '생사경'])
  difficulty: string;

  @ApiProperty()
  @IsInt()
  category_id: number;

  @ApiProperty({ type: [CreateRecipeIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];

  @ApiProperty({ type: [CreateRecipeStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepDto)
  steps: CreateRecipeStepDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnail_url?: string;
}