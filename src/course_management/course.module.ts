import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { Lesson, LessonContent } from './entities/lesson.entity';
import { Quiz, Question, Answer } from './entities/quiz.entity';
import { AuthModule } from '../auth/auth.module'; // Assuming auth module path for forwardRef if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, LessonContent, Quiz, Question, Answer]),
    AuthModule, // Import if you need User/Instructor entities or services
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService], // If needed in other modules
})
export class CourseModule {}