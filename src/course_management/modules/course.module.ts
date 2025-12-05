import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from '../services/course.service';
import { LessonService } from '../services/lesson.service';
import { QuizService } from '../services/quiz.service';
import { MediaModule } from './media.module';
import { CourseController } from '../controllers/course.controller';
import { LessonController } from '../controllers/lesson.controller';
import { QuizController } from '../controllers/quiz.controller';
import { Course } from '../entities/course.entity';
import { Instructor } from 'src/auth/entities/user.entity';
import { Lesson, LessonContent } from '../entities/lesson.entity';
import { Quiz, Question, Answer } from '../entities/quiz.entity';
import { AuthModule } from '../../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Instructor, Lesson, LessonContent, Quiz, Question, Answer]),
    AuthModule, MediaModule
  ],
  providers: [CourseService, LessonService, QuizService],
  controllers: [CourseController, LessonController, QuizController],
  exports: [CourseService, LessonService, QuizService], // If needed in other modules
})
export class CourseModule {}