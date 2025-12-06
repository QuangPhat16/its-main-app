import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { QuizAttemptService } from './quiz-attempt.service';
import { StartAttemptDto } from './dto/dtos'
import { SubmitAttemptDto } from './dto/dtos';

@ApiTags('Quiz Attempts')
@Controller('attempts')
export class QuizAttemptController {
   constructor(private attemptService: QuizAttemptService) {}

   @Post()
   @ApiBody({ type: StartAttemptDto })
   start(@Body() dto: StartAttemptDto) {
      const studentId = "STUDENT_FAKE_ID"; // replace with auth user
      return this.attemptService.startAttempt(dto.quizId, studentId);
   }

   @Put(':attemptId/submit')
   @ApiBody({ type: SubmitAttemptDto })
   submit(
      @Param('attemptId') attemptId: string,
      @Body() dto: SubmitAttemptDto,
   ) {
      const studentId = "STUDENT_FAKE_ID"; // replace with auth user
      return this.attemptService.submitAttempt(attemptId, studentId, dto);
   }

   @Get(':attemptId')
   getAttempt(@Param('attemptId') attemptId: string) {
      const studentId = "STUDENT_FAKE_ID"; // replace with auth user
      return this.attemptService.getAttempt(attemptId, studentId);
   }
}
