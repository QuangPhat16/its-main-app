import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './service/course.service';
import { LessonService } from './service/lesson.service';
import { QuizService } from './service/quiz.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { Lesson, LessonContent } from './entities/lesson.entity';
import { Quiz, Question, Answer } from './entities/quiz.entity';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, LessonContent, Quiz, Question, Answer]),
    AuthModule, 
  ],
  providers: [CourseService, LessonService, QuizService],
  controllers: [CourseController],
  exports: [CourseService, LessonService, QuizService], // If needed in other modules
})
export class CourseModule {}