// src/course/lesson.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto, UpdateLessonDto, CreateLessonContentDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { Request } from 'express';
import { ContentType } from '../entities/lesson.entity';

@Controller('courses')
@UseGuards(JwtAuthGuard) // Authenticate all routes
export class LessonController {
   constructor(private readonly lessonService: LessonService) {}

   // Lesson Routes (nested under course)
   @Post(':courseId/lessons')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   async createLesson(
      @Param('courseId') courseId: string,
      @Req() req: Request & { user: any },
      @Body() dto: CreateLessonDto,
   ) {
      return this.lessonService.createLesson(courseId, req.user.id, dto);
   }

   @Get(':courseId/lessons')
   async getLessonsByCourse(@Param('courseId') courseId: string, @Query('loadContents') loadContents: boolean) {
      return this.lessonService.getLessonsByCourse(courseId, loadContents);
   }

   @Get(':courseId/lessons/:lessonId')
   async getLessonById(@Param('lessonId') lessonId: string, @Query('loadRelations') loadRelations: boolean) {
      return this.lessonService.getLessonById(lessonId, loadRelations);
   }

   @Patch(':courseId/lessons/:lessonId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   async updateLesson(
      @Param('lessonId') lessonId: string,
      @Req() req: Request & { user: any },
      @Body() dto: UpdateLessonDto,
   ) {
      return this.lessonService.updateLesson(lessonId, req.user.id, dto);
   }

   @Delete(':courseId/lessons/:lessonId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   async deleteLesson(@Param('lessonId') lessonId: string, @Req() req: Request & { user: any }) {
      await this.lessonService.deleteLesson(lessonId, req.user.id);
      return { message: 'Lesson deleted successfully' };
   }

   // LessonContent Routes (create/delete only, nested under lesson)

   @Post(':courseId/lessons/:lessonId/content')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   async createLessonContent(
      @Param('lessonId') lessonId: string,
      @Req() req: Request & { user: any },
      @Body() dto: CreateLessonContentDto,
   ) {
      if (dto.type !== ContentType.TEXT) {
         const uploadData = await this.lessonService.createLessonContent(lessonId, req.user.id, dto); // Returns pre-signed data
         return { message: 'Use this for upload', ...uploadData }; // FE gets url/fields/key
      }
      return this.lessonService.createLessonContent(lessonId, req.user.id, dto);
   }

   // Confirm after FE upload
   @Post('content/:contentId/confirm')
   async confirmUpload(@Param('contentId') contentId: string, @Body() { key }: { key: string }) {
      return this.lessonService.confirmMediaUpload(contentId, key);
   }

   @Delete(':courseId/lessons/:lessonId/content/:contentId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   async deleteLessonContent(@Param('contentId') contentId: string, @Req() req: Request & { user: any }) {
      await this.lessonService.deleteLessonContent(contentId, req.user.id);
      return { message: 'Content deleted successfully' };
   }
}