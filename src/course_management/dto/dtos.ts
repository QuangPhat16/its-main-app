import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsUrl, IsNumber, Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType } from "../entities/lesson.entity";

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced NestJS', description: 'Course title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Build production apps with NestJS...', description: 'Course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '36.36', description: 'Course price' })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced NestJS v2' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '36.36', description: 'Course price' })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreateLessonDto {
  @ApiProperty({ example: 'Introduction to Modules' })
  @IsString()
  lessonName: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ type: 'array', items: { type: 'object' }, description: 'Lesson contents (text or media)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonContentDto)
  contents?: CreateLessonContentDto[];
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ example: 'Updated Lesson Title' })
  @IsOptional()
  @IsString()
  lessonName?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateLessonContentDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: 'video-intro.mp4' })
  @IsString()
  contentName: string;

  @ApiProperty({ enum: ContentType, example: ContentType.TEXT })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiPropertyOptional({ example: 'This is a text content' })
  @IsOptional()
  @IsString()
  text?: string;
}


export class CreateQuizDto {
  @ApiProperty({ example: 'Regular Quiz 1' })
  @IsString()
  quizName: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimit?: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpdateQuizDto {
  @ApiProperty({ example: 'Regular Quiz 2' })
  @IsString()
  quizName?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is dependency injection?' })
  @IsString()
  questionName: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

export class CreateAnswerDto {
  @ApiProperty({ example: 'A way to pass dependencies' })
  @IsString()
  content: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Type(() => Boolean)
  isCorrect: boolean;
}