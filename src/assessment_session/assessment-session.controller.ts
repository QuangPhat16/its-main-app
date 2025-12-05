import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AssessmentSessionService } from './assessment-session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/entities/user.entity';

@Controller('assessment-sessions')
@UseGuards(JwtAuthGuard)
// @Roles(UserRole.STUDENT)
export class AssessmentSessionController {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  // Student bắt đầu làm quiz
  @Post()
  async startSession(@Body() dto: CreateSessionDto, @Request() req) {
    const studentId = req.user.userId; // payload JwtStrategy.validate
    return this.sessionService.startSession(studentId, dto);
  }

  // Lấy trạng thái hiện tại của session
  @Get(':id')
  async getSession(@Param('id') id: string, @Request() req) {
    const studentId = req.user.userId;
    return this.sessionService.getSession(id, studentId);
  }

  // Lưu câu trả lời cho 1 câu hỏi
  @Post(':id/answers')
  async saveAnswer(
    @Param('id') id: string,
    @Body() dto: SaveAnswerDto,
    @Request() req,
  ) {
    const studentId = req.user.userId;
    return this.sessionService.saveAnswer(id, studentId, dto);
  }

  // Kết thúc bài test
  @Post(':id/finish')
  async finishSession(@Param('id') id: string, @Request() req) {
    const studentId = req.user.userId;
    return this.sessionService.finishSession(id, studentId);
  }
}
