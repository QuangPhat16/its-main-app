import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
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
}