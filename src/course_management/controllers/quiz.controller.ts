import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('quizzes')
@ApiBearerAuth('access-token')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class QuizController {
   constructor(private readonly quizService: QuizService) {}
   
   // ========== QUIZ CRUD ==========
   @Post(':courseId/quizzes')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Create quiz in a course' })
   @ApiBody({ type: CreateQuizDto })
   @ApiResponse({ status: 201, description: 'Quiz created with questions & answers' })
   createQuiz(
      @Param('courseId') courseId: string,
      @Req() req: any,
      @Body() dto: CreateQuizDto,
   ) {
      return this.quizService.createQuiz(courseId, req.user.id, dto);
   }

   @Get(':courseId/quizzes')
   @ApiOperation({ summary: 'Get all quizzes in a course' })
   @ApiQuery({ name: 'loadQuestions', required: false, type: Boolean })
   getQuizzesByCourse(
      @Param('courseId') courseId: string,
      @Query('loadQuestions') loadQuestions = false,
   ) {
      return this.quizService.getQuizzesByCourse(courseId, loadQuestions);
   }

   @Get(':courseId/quizzes/:quizId')
   @ApiOperation({ summary: 'Get single quiz by ID' })
   @ApiQuery({ name: 'loadRelations', required: false, type: Boolean })
   @ApiResponse({ status: 200, description: 'Quiz with questions & answers' })
   getQuizById(
      @Param('quizId') quizId: string,
      @Query('loadRelations') loadRelations = false,
   ) {
      return this.quizService.getQuizById(quizId, loadRelations);
   }

   @Patch(':courseId/quizzes/:quizId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Update quiz (owner only)' })
   updateQuiz(
      @Param('quizId') quizId: string,
      @Req() req: any,
      @Body() dto: UpdateQuizDto,
   ) {
      return this.quizService.updateQuiz(quizId, req.user.id, dto);
   }

   @Delete(':courseId/quizzes/:quizId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Delete quiz (owner only)' })
   deleteQuiz(@Param('quizId') quizId: string, @Req() req: any) {
      return this.quizService.deleteQuiz(quizId, req.user.id);
   }

   // ========== QUESTION CRUD (nested) ==========
   @Post(':courseId/quizzes/:quizId/questions')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Add a question to a quiz' })
   @ApiBody({ type: CreateQuestionDto })
   createQuestion(
      @Param('quizId') quizId: string,
      @Req() req: any,
      @Body() dto: CreateQuestionDto,
   ) {
      return this.quizService.createQuestion(quizId, req.user.id, dto);
   }

   @Delete(':courseId/quizzes/:quizId/questions/:questionId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Delete a question from a quiz' })
   deleteQuestion(@Param('questionId') questionId: string, @Req() req: any) {
      return this.quizService.deleteQuestion(questionId, req.user.id);
   }
}