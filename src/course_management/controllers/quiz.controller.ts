// src/course/quiz.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { Request } from 'express';

@Controller('courses')
@UseGuards(JwtAuthGuard) // Authenticate all routes
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // Quiz Routes (nested under course)
  @Post(':courseId/quizzes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createQuiz(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: any },
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizService.createQuiz(courseId, req.user.id, dto);
  }

  @Get(':courseId/quizzes')
  async getQuizzesByCourse(@Param('courseId') courseId: string, @Query('loadQuestions') loadQuestions: boolean) {
    return this.quizService.getQuizzesByCourse(courseId, loadQuestions);
  }

  @Get(':courseId/quizzes/:quizId')
  async getQuizById(@Param('quizId') quizId: string, @Query('loadRelations') loadRelations: boolean) {
    return this.quizService.getQuizById(quizId, loadRelations);
  }

  @Patch(':courseId/quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async updateQuiz(
    @Param('quizId') quizId: string,
    @Req() req: Request & { user: any },
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizService.updateQuiz(quizId, req.user.id, dto);
  }

  @Delete(':courseId/quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteQuiz(@Param('quizId') quizId: string, @Req() req: Request & { user: any }) {
    await this.quizService.deleteQuiz(quizId, req.user.id);
    return { message: 'Quiz deleted successfully' };
  }

  // Question Routes (create/delete only, nested under quiz)
  @Post(':courseId/quizzes/:quizId/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createQuestion(
    @Param('quizId') quizId: string,
    @Req() req: Request & { user: any },
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizService.createQuestion(quizId, req.user.id, dto);
  }

  @Delete(':courseId/quizzes/:quizId/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteQuestion(@Param('questionId') questionId: string, @Req() req: Request & { user: any }) {
    await this.quizService.deleteQuestion(questionId, req.user.id);
    return { message: 'Question deleted successfully' };
  }
}