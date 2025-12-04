import {Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query,} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateLessonContentDto,
  CreateQuestionDto,
} from './dto/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user-role.enum';
import { Request } from 'express';

@Controller('courses')
@UseGuards(JwtAuthGuard) // Authenticate all routes
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createCourse(@Req() req: Request & { user: any }, @Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(req.user as any, dto); // Assuming req.user is Instructor instance
  }

  @Get()
  async getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string, @Query('loadRelations') loadRelations: boolean) {
    return this.courseService.getCourseById(id, loadRelations);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async updateCourse(@Param('id') id: string, @Req() req: Request & { user: any }, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteCourse(@Param('id') id: string, @Req() req: Request & { user: any }) {
    await this.courseService.deleteCourse(id, req.user.id);
    return { message: 'Course deleted successfully' };
  }

  // Lesson Routes (nested under course)

  @Post(':courseId/lessons')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createLesson(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: any },
    @Body() dto: CreateLessonDto,
  ) {
    return this.courseService.createLesson(courseId, req.user.id, dto);
  }

  @Get(':courseId/lessons')
  async getLessonsByCourse(@Param('courseId') courseId: string, @Query('loadContents') loadContents: boolean) {
    return this.courseService.getLessonsByCourse(courseId, loadContents);
  }

  @Get(':courseId/lessons/:lessonId')
  async getLessonById(@Param('lessonId') lessonId: string, @Query('loadRelations') loadRelations: boolean) {
    return this.courseService.getLessonById(lessonId, loadRelations);
  }

  @Patch(':courseId/lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: Request & { user: any },
    @Body() dto: UpdateLessonDto,
  ) {
    return this.courseService.updateLesson(lessonId, req.user.id, dto);
  }

  @Delete(':courseId/lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteLesson(@Param('lessonId') lessonId: string, @Req() req: Request & { user: any }) {
    await this.courseService.deleteLesson(lessonId, req.user.id);
    return { message: 'Lesson deleted successfully' };
  }

  // Quiz Routes (nested under course)

  @Post(':courseId/quizzes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createQuiz(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: any },
    @Body() dto: CreateQuizDto,
  ) {
    return this.courseService.createQuiz(courseId, req.user.id, dto);
  }

  @Get(':courseId/quizzes')
  async getQuizzesByCourse(@Param('courseId') courseId: string, @Query('loadQuestions') loadQuestions: boolean) {
    return this.courseService.getQuizzesByCourse(courseId, loadQuestions);
  }

  @Get(':courseId/quizzes/:quizId')
  async getQuizById(@Param('quizId') quizId: string, @Query('loadRelations') loadRelations: boolean) {
    return this.courseService.getQuizById(quizId, loadRelations);
  }

  @Patch(':courseId/quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async updateQuiz(
    @Param('quizId') quizId: string,
    @Req() req: Request & { user: any },
    @Body() dto: UpdateQuizDto,
  ) {
    return this.courseService.updateQuiz(quizId, req.user.id, dto);
  }

  @Delete(':courseId/quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteQuiz(@Param('quizId') quizId: string, @Req() req: Request & { user: any }) {
    await this.courseService.deleteQuiz(quizId, req.user.id);
    return { message: 'Quiz deleted successfully' };
  }

  // LessonContent Routes (create/delete only, nested under lesson)

  @Post(':courseId/lessons/:lessonId/contents')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async createLessonContent(
    @Param('lessonId') lessonId: string,
    @Req() req: Request & { user: any },
    @Body() dto: CreateLessonContentDto,
  ) {
    return this.courseService.createLessonContent(lessonId, req.user.id, dto);
  }

  @Delete(':courseId/lessons/:lessonId/contents/:contentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteLessonContent(@Param('contentId') contentId: string, @Req() req: Request & { user: any }) {
    await this.courseService.deleteLessonContent(contentId, req.user.id);
    return { message: 'Content deleted successfully' };
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
    return this.courseService.createQuestion(quizId, req.user.id, dto);
  }

  @Delete(':courseId/quizzes/:quizId/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteQuestion(@Param('questionId') questionId: string, @Req() req: Request & { user: any }) {
    await this.courseService.deleteQuestion(questionId, req.user.id);
    return { message: 'Question deleted successfully' };
  }
}