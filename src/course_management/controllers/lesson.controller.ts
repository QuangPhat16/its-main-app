import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto, UpdateLessonDto, CreateLessonContentDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { ContentType } from '../entities/lesson.entity';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('lessons')
@ApiBearerAuth('access-token')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class LessonController {
   constructor(private readonly lessonService: LessonService) {}
   // ========== LESSON CRUD ==========

   @Post(':courseId/lessons')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Create a new lesson in a course (instructor only)' })
   @ApiBody({ type: CreateLessonDto })
   @ApiResponse({ status: 201, description: 'Lesson created' })
   createLesson(
      @Param('courseId') courseId: string,
      @Req() req: any,
      @Body() dto: CreateLessonDto,
   ){
      return this.lessonService.createLesson(courseId, req.user.userId, dto);
   }

   @Get(':courseId/lessons')
   @ApiOperation({ summary: 'Get all lessons in a course' })
   @ApiQuery({ name: 'loadContents', required: false, type: Boolean, description: 'Load lesson contents?' })
   @ApiResponse({ status: 200, description: 'List of lessons' })
   getLessonsByCourse(
      @Param('courseId') courseId: string,
      @Query('loadContents') loadContents = false,
   ) {
      return this.lessonService.getLessonsByCourse(courseId, loadContents);
   }

   @Get(':courseId/lessons/:lessonId')
   @ApiOperation({ summary: 'Get a single lesson by ID' })
   @ApiQuery({ name: 'loadRelations', required: false, type: Boolean })
   @ApiResponse({ status: 200, description: 'Lesson details' })
   @ApiResponse({ status: 404, description: 'Lesson not found' })
   getLessonById(
      @Param('lessonId') lessonId: string,
      @Query('loadRelations') loadRelations = false,
   ) {
      return this.lessonService.getLessonById(lessonId, loadRelations);
   }

   @Patch(':courseId/lessons/:lessonId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Update lesson (owner only)' })
   @ApiResponse({ status: 200, description: 'Lesson updated' })
   updateLesson(
      @Param('lessonId') lessonId: string,
      @Req() req: any,
      @Body() dto: UpdateLessonDto,
   ) {
      return this.lessonService.updateLesson(lessonId, req.user.userId, dto);
   }

   @Delete(':courseId/lessons/:lessonId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Delete lesson (owner only)' })
   @ApiResponse({ status: 200, description: 'Lesson deleted' })
   deleteLesson(@Param('lessonId') lessonId: string, @Req() req: any) {
      return this.lessonService.deleteLesson(lessonId, req.user.userId);
   }

   // ========== LESSON CONTENT (TEXT + MEDIA) ==========
   @Post(':courseId/lessons/:lessonId/content')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Create lesson content — text or media upload' })
   @ApiBody({ type: CreateLessonContentDto })
   @ApiResponse({
      status: 200,
      description: `
         • TEXT: returns saved content
         • MEDIA: returns pre-signed S3 upload data (url, fields, key)
      `,
   })
   async createLessonContent(
      @Param('lessonId') lessonId: string,
      @Req() req: any,
      @Body() dto: CreateLessonContentDto,
   ){
      if (dto.type !== ContentType.TEXT) {
         const uploadData = await this.lessonService.createLessonContent(lessonId, req.user.userId, dto);
         return { message: 'Upload file using this data:', ...uploadData };
      }
      return this.lessonService.createLessonContent(lessonId, req.user.userId, dto);
   }

   @Post('content/:contentId/confirm')
   @ApiOperation({ summary: 'Confirm media upload completed (after frontend PUT to S3)' })
   @ApiBody({ schema: { example: { key: 'lessons/media/abc123-video.mp4' } } })
   @ApiResponse({ status: 200, description: 'Media URL saved to database' })
   confirmUpload(@Param('contentId') contentId: string, @Body() body: { key: string }) {
      return this.lessonService.confirmMediaUpload(contentId, body.key);
   }

   @Delete(':courseId/lessons/:lessonId/content/:contentId')
   @UseGuards(RolesGuard)
   @Roles(UserRole.INSTRUCTOR)
   @ApiOperation({ summary: 'Delete lesson content (text or media)' })
   @ApiResponse({ status: 200, description: 'Content + S3 file deleted' })
   deleteLessonContent(@Param('contentId') contentId: string, @Req() req: any) {
      return this.lessonService.deleteLessonContent(contentId, req.user.userId);
   }
}