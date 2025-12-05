import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';


@ApiTags('courses')
@ApiBearerAuth('access-token')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new course (instructor only)' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published courses (public)' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get('instructor/me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all courses created by logged-in instructor' })
  getMyInstructorCourses(@Req() req: any) {
    return this.courseService.getInstructorCourses(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update course (owner only)' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  updateCourse(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete course (owner only)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  deleteCourse(@Param('id') id: string, @Req() req: any) {
    return this.courseService.deleteCourse(id, req.user.id);
  }
}