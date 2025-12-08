import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType, Lesson, LessonContent } from '../entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto, CreateLessonContentDto } from '../dto/dtos';
import { CourseService } from './course.service';
import { MediaService } from './media.service';
import { Course } from '../entities/course.entity';

@Injectable()
export class LessonService {
   constructor(
      private courseService: CourseService, // Injected for ownership check
      private mediaService: MediaService, //Injected for media content commands
      @InjectRepository(Lesson)
      private lessonRepo: Repository<Lesson>,
      @InjectRepository(LessonContent)
      private contentRepo: Repository<LessonContent>,
   ) {}

   async createLesson(courseId: string, instructorId: string, dto: CreateLessonDto): Promise<Lesson> {
      // console.log("Validating instructor...")
      // console.log("instrucor id: ", instructorId)
      // console.log("course id: ", courseId)
      const course = await this.courseService.verifyCourseOwnership(courseId, instructorId);
      const lesson = this.lessonRepo.create({ ...dto, courseId });
      if(dto.contents){
         lesson.contents = dto.contents.map((contentDto, index) =>
            this.contentRepo.create({
               ...contentDto,
               lessonId: lesson.id,
               order: index + 1, 
            })
      );}
      const lastOrder = await this.lessonRepo.count({ where: { course: { id: courseId } } });
      lesson.order = lastOrder + 1;
      return this.lessonRepo.save(lesson);
   }

   async getLessonsByCourse(courseId: string, loadContents = false): Promise<Lesson[]> {
      // const relations = loadContents ? ['contents', 'course'] : ['course'];
      return this.lessonRepo.find({ where: {  courseId } },);
   }

   async getLessonById(id: string, loadRelations = false): Promise<Lesson> {

      const lesson = await this.lessonRepo.findOne({ where: { id }, relations: ['contents'] });
      if (!lesson) {
         throw new NotFoundException(`Lesson with ID ${id} not found`);
      }
      return lesson;
   }

   async updateLesson(id: string, instructorId: string, dto: UpdateLessonDto): Promise<Lesson> {
      const lesson = await this.getLessonById(id);
      await this.courseService.verifyCourseOwnership(lesson.courseId, instructorId);
      Object.assign(lesson, dto);
      return this.lessonRepo.save(lesson);
   }

   async deleteLesson(id: string, instructorId: string): Promise<void> {
      const lesson = await this.getLessonById(id);
      await this.courseService.verifyCourseOwnership(lesson.courseId, instructorId);
      await this.lessonRepo.remove(lesson);
   }

   async createLessonContent(lessonId: string, instructorId: string, dto: CreateLessonContentDto) {
      const lesson = await this.getLessonById(lessonId);
      await this.courseService.verifyCourseOwnership(lesson.courseId, instructorId);

      //Create content first regarddless the type
      const content = this.contentRepo.create({
         ...dto,
         lesson: { id: lesson.id } as Lesson,
      });
      const lastOrder = await this.contentRepo.count({ where: { lesson: { id: lessonId } } });
      content.order = lastOrder + 1;
      await this.contentRepo.save(content);

      if (dto.type !== ContentType.TEXT) {

         // Generate pre-signed URL
         const { url, fields, key } = await this.mediaService.generateUploadUrl(
            dto.contentName,
            dto.type
         );

         return {
            contentId: content.id, // FE uses this to confirm
            preSignedUrl: url,
            fields,
            key,
         };

      } else{//Text type, return full object

         return content
      }

   }


   async confirmMediaUpload(contentId: string, key: string): Promise<LessonContent> {
      const content = await this.contentRepo.findOne({ where: { id: contentId } });
      if (!content) throw new NotFoundException();
      content.url = this.mediaService.getPublicUrl(key);
      // Add metadata
      const lessonId = content.lesson.id;
      const lastOrder = await this.contentRepo.count({ where: { lesson: { id: lessonId } } });
      content.order = lastOrder + 1;
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

      await this.courseService.verifyCourseOwnership(content.lesson.courseId, instructorId);
      
      if (content.url) {
         const key = this.extractKeyFromUrl(content.url); // Implement: parse URL to get key
         await this.mediaService.deleteFromS3(key);
      }
      await this.contentRepo.remove(content);
   }


   private extractKeyFromUrl(url: string): string {
      const bucket = process.env.AWS_S3_BUCKET
      const region = process.env.AWS_REGION
      const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
      return url.replace(prefix, '');
  }
}