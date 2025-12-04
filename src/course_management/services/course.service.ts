import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Instructor } from '../../auth/entities/user.entity'; // Adjust path
import { CreateCourseDto, UpdateCourseDto } from '../dto/dtos';
import { CourseStatus } from '../entities/course.entity';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(Course)
      private courseRepo: Repository<Course>,
   ) {}

   async createCourse(instructor: Instructor, dto: CreateCourseDto): Promise<Course> {
      const course = this.courseRepo.create({ ...dto, instructor });
      return this.courseRepo.save(course);
   }

   async getAllCourses(): Promise<Partial<Course>[]> {
      return this.courseRepo.find({
         where: { status: CourseStatus.PUBLISH },
         select: ['id', 'title'],
      });
   }

   async getInstructorCourses(instructorId: string): Promise<Partial<Course>[]> {
      return this.courseRepo.find({
         where: { instructor: { id: instructorId } },
         select: ['id', 'title'],
         relations: ['instructor'],
      });
   }

   async getCourseById(id: string, loadRelations = false): Promise<Course> {
      const relations = loadRelations
         ? ['instructor', 'lessons', 'lessons.contents', 'quizzes', 'quizzes.questions', 'quizzes.questions.answers']
         : ['instructor'];

      const course = await this.courseRepo.findOne({ where: { id }, relations });
      if (!course) {
         throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return course;
   }

   async updateCourse(id: string, instructorId: string, dto: UpdateCourseDto): Promise<Course> {
      const course = await this.getCourseById(id);
      if (course.instructor.id !== instructorId) {
         throw new ForbiddenException('You can only update your own courses');
      }
      Object.assign(course, dto);
      return this.courseRepo.save(course);
   }

   async deleteCourse(id: string, instructorId: string): Promise<void> {
      const course = await this.getCourseById(id);
      if (course.instructor.id !== instructorId) {
         throw new ForbiddenException('You can only delete your own courses');
      }
      await this.courseRepo.remove(course);
   }

   // Helper for other services: Check if instructor owns the course
   async verifyCourseOwnership(courseId: string, instructorId: string): Promise<Course> {
      const course = await this.getCourseById(courseId);
      if (course.instructor.id !== instructorId) {
         throw new ForbiddenException('You do not own this course');
      }
      return course;
   }
}