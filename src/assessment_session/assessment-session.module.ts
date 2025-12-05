import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssessmentSession,
  AssessmentAnswer,
} from './entities/assessment-session.entity';
import { AssessmentSessionService } from './assessment-session.service';
import { AssessmentSessionController } from './assessment-session.controller';
import {
  Quiz,
  Question,
  Answer,
} from 'src/course_management/entities/quiz.entity';
import { Student } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssessmentSession,
      AssessmentAnswer,
      Quiz,
      Question,
      Answer,
      Student,
    ]),
    AuthModule,
  ],
  providers: [AssessmentSessionService],
  controllers: [AssessmentSessionController],
  exports: [AssessmentSessionService],
})
export class AssessmentSessionModule {}
