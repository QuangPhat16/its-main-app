import { Controller, Post, Put, Get, Param, Body, UseGuards , Req} from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { QuizAttemptService } from './quiz-attempt.service';
import { StartAttemptDto } from './dto/dtos'
import { SubmitAttemptDto } from './dto/dtos';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Quiz Attempts')
@ApiBearerAuth('access-token')
@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptController {
   constructor(private attemptService: QuizAttemptService) {}

   @Post()
   @ApiBody({ type: StartAttemptDto })
   start(@Req() req: any, @Body() dto: StartAttemptDto) {
      const studentId = req.user.userId; 
      return this.attemptService.startAttempt(dto.quizId, studentId);
   }

   @Put(':attemptId/submit')
   @ApiBody({ type: SubmitAttemptDto })
   submit(
      @Param('attemptId') attemptId: string,
      @Req() req: any,
      @Body() dto: SubmitAttemptDto,
   ) {
      const studentId = req.user.userId; 
      return this.attemptService.submitAttempt(attemptId, studentId, dto);
   }

   @Get(':attemptId')
   getAttempt(@Param('attemptId') attemptId: string, @Req() req: any,) {
      const studentId = req.user.userId; 
      return this.attemptService.getAttempt(attemptId, studentId);
   }
}
