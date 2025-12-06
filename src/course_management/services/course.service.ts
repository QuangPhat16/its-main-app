import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Instructor, UserRole } from '../../auth/entities/user.entity'; 
import { CreateCourseDto, UpdateCourseDto } from '../dto/dtos';
import { CourseStatus } from '../entities/course.entity';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(Course)
      private courseRepo: Repository<Course>,

     @InjectRepository(Instructor)
      private instructorRepo: Repository<Instructor>
   ){}

   async createCourse(authUser: { userId: string; role: string }, dto: CreateCourseDto): Promise<Course> {
      if (authUser.role !== UserRole.INSTRUCTOR) {
         throw new ForbiddenException('Only instructors can create courses');
      }

      const instructor = await this.instructorRepo.findOne({ where: { id: authUser.userId }});
      if (!instructor) {
         throw new NotFoundException('Instructor not found');
      }

      const course = this.courseRepo.create({
         ...dto,
         instructorId: authUser.userId
      });

      return this.courseRepo.save(course);
      }


   async getAllCourses(): Promise<Partial<Course>[]> {
      return this.courseRepo.find({
         where: { status: CourseStatus.PUBLISH },
         select: ['id', 'title', 'price', 'description'],
      });
   }

   async getInstructorCourses(instructorId: string): Promise<Partial<Course>[]> {
      return this.courseRepo.find({
         where: { instructor: { id: instructorId } },
         select: ['id', 'title', 'price', 'description'],
         // relations: ['instructor'],
      });
   }

   async getCourseById(id: string): Promise<Course> {
      const course = await this.courseRepo
         .createQueryBuilder('course')
         .leftJoinAndSelect('course.instructor', 'instructor')
         .select([
            'course',
            'instructor.id',
            'instructor.name',
         ])
         .where('course.id = :id', { id })
         .getOne();
      if (!course) {
         throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return course;
   }

   async updateCourse(id: string, instructorId: string, dto: UpdateCourseDto): Promise<Course> {
      const course = await this.getCourseById(id);
      if (course.instructorId !== instructorId) {
         throw new ForbiddenException('You can only update your own courses');
      }
      Object.assign(course, dto);
      return this.courseRepo.save(course);
   }

   async deleteCourse(id: string, instructorId: string): Promise<void> {
      const course = await this.getCourseById(id);
      if (course.instructorId !== instructorId) {
         throw new ForbiddenException('You can only delete your own courses');
      }
      await this.courseRepo.remove(course);
   }

   // Helper for other services: Check if instructor owns the course
   async verifyCourseOwnership(courseId: string, instructorId: string): Promise<Course> {
      const course = await this.getCourseById(courseId);
      console.log("Course info: ",course)
      if (course.instructorId !== instructorId) {
         throw new ForbiddenException('You do not own this course');
      }
      return course;
   }
}