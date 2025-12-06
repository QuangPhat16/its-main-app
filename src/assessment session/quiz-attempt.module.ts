import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from './entities/quizz.attempt.entity';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';
import { Quiz, Question, Answer } from '../course_management/entities/quiz.entity';

@Module({
  imports: [
   TypeOrmModule.forFeature([QuizAttempt, Quiz, Question, Answer]),
  ],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService],
})
export class QuizAttemptModule {}