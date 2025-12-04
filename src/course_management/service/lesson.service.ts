import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, LessonContent } from '../entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto, CreateLessonContentDto } from '../dto/dtos';
import { CourseService } from './course.service'; // DIP: Depend on abstraction if interfaced

@Injectable()
export class LessonService {
   constructor(
      private courseService: CourseService, // Injected for ownership check
      @InjectRepository(Lesson)
      private lessonRepo: Repository<Lesson>,
      @InjectRepository(LessonContent)
      private contentRepo: Repository<LessonContent>,
   ) {}

   async createLesson(courseId: string, instructorId: string, dto: CreateLessonDto): Promise<Lesson> {
      const course = await this.courseService.verifyCourseOwnership(courseId, instructorId);
      const lesson = this.lessonRepo.create({ ...dto, course });
      lesson.contents = dto.contents.map((contentDto) =>
         this.contentRepo.create({ ...contentDto, lesson }),
      );
      return this.lessonRepo.save(lesson);
   }

   async getLessonsByCourse(courseId: string, loadContents = false): Promise<Lesson[]> {
      const relations = loadContents ? ['contents', 'course'] : ['course'];
      return this.lessonRepo.find({ where: { course: { id: courseId } }, relations });
   }

   async getLessonById(id: string, loadRelations = false): Promise<Lesson> {
      const relations = loadRelations ? ['course', 'contents'] : ['course'];
      const lesson = await this.lessonRepo.findOne({ where: { id }, relations });
      if (!lesson) {
         throw new NotFoundException(`Lesson with ID ${id} not found`);
      }
      return lesson;
   }

   async updateLesson(id: string, instructorId: string, dto: UpdateLessonDto): Promise<Lesson> {
      const lesson = await this.getLessonById(id);
      await this.courseService.verifyCourseOwnership(lesson.course.id, instructorId);
      Object.assign(lesson, dto);
      return this.lessonRepo.save(lesson);
   }

   async deleteLesson(id: string, instructorId: string): Promise<void> {
      const lesson = await this.getLessonById(id);
      await this.courseService.verifyCourseOwnership(lesson.course.id, instructorId);
      await this.lessonRepo.remove(lesson);
   }

   async createLessonContent(lessonId: string, instructorId: string, dto: CreateLessonContentDto): Promise<LessonContent> {
      const lesson = await this.getLessonById(lessonId);
      await this.courseService.verifyCourseOwnership(lesson.course.id, instructorId);
      const content = this.contentRepo.create({ ...dto, lesson });
      return this.contentRepo.save(content);
   }

   async deleteLessonContent(id: string, instructorId: string): Promise<void> {
      const content = await this.contentRepo.findOne({
         where: { id },
         relations: ['lesson', 'lesson.course'],
      });
      if (!content) {
         throw new NotFoundException(`Content with ID ${id} not found`);
      }
      await this.courseService.verifyCourseOwnership(content.lesson.course.id, instructorId);
      await this.contentRepo.remove(content);
   }
}