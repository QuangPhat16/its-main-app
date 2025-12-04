import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from '../services/course.service';
import { LessonService } from '../services/lesson.service';
import { QuizService } from '../services/quiz.service';
import { MediaService } from '../services/media.service';
import { MediaModule } from './media.module';
import { CourseController } from '../controllers/course.controller';
import { Course } from '../entities/course.entity';
import { Lesson, LessonContent } from '../entities/lesson.entity';
import { Quiz, Question, Answer } from '../entities/quiz.entity';
import { AuthModule } from '../../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, LessonContent, Quiz, Question, Answer]),
    AuthModule, MediaModule
  ],
  providers: [CourseService, LessonService, QuizService],
  controllers: [CourseController],
  exports: [CourseService, LessonService, QuizService], // If needed in other modules
})
export class CourseModule {}