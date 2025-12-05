import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AssessmentSession,
  AssessmentAnswer,
  SessionStatus,
} from './entities/assessment-session.entity';
import {
  Quiz,
  Question,
  Answer,
} from 'src/course_management/entities/quiz.entity';
import { Student } from 'src/auth/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';

@Injectable()
export class AssessmentSessionService {
  constructor(
    @InjectRepository(AssessmentSession)
    private readonly sessionRepo: Repository<AssessmentSession>,
    @InjectRepository(AssessmentAnswer)
    private readonly answerRepo: Repository<AssessmentAnswer>,
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepoBase: Repository<Answer>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async startSession(
    studentId: string,
    dto: CreateSessionDto,
  ): Promise<AssessmentSession> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const quiz = await this.quizRepo.findOne({
      where: { id: dto.quizId },
      relations: ['questions'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const existing = await this.sessionRepo.findOne({
      where: {
        student: { id: studentId },
        quiz: { id: quiz.id },
        status: SessionStatus.IN_PROGRESS,
      },
    });
    if (existing) return existing; // hoặc throw lỗi nếu bạn không muốn resume

    const totalQuestions = quiz.questions.length;

    const session = this.sessionRepo.create({
      student,
      quiz,
      status: SessionStatus.IN_PROGRESS,
      currentQuestionIndex: 0,
      totalQuestions,
    });

    return this.sessionRepo.save(session);
  }

  async getSession(
    sessionId: string,
    studentId: String,
  ): Promise<AssessmentSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: [
        'quiz',
        'quiz.questions',
        'answers',
        'answers.question',
        'answers.selectedAnswer',
      ],
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.student.id !== studentId) {
      throw new ForbiddenException('Cannot access other student session');
    }
    return session;
  }

  async saveAnswer(
    sessionId: string,
    studentId: String,
    dto: SaveAnswerDto,
  ): Promise<AssessmentSession> {
    const session = await this.getSession(sessionId, studentId);

    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress');
    }

    const question = await this.questionRepo.findOne({
      where: { id: dto.questionId },
      relations: ['quiz'],
    });
    if (!question || question.quiz.id !== session.quiz.id) {
      throw new BadRequestException('Question does not belong to this quiz');
    }

    const answer = await this.answerRepoBase.findOne({
      where: { id: dto.selectedAnswerId },
      relations: ['question'],
    });
    if (!answer || answer.question.id !== question.id) {
      throw new BadRequestException('Answer does not belong to this question');
    }

    const isCorrect = answer.correct;

    let attemptAnswer = await this.answerRepo.findOne({
      where: {
        session: { id: session.id },
        question: { id: question.id },
      },
    });

    if (!attemptAnswer) {
      attemptAnswer = this.answerRepo.create({
        session,
        question,
        selectedAnswer: answer,
        isCorrect,
      });
    } else {
      attemptAnswer.selectedAnswer = answer;
      attemptAnswer.isCorrect = isCorrect;
    }

    await this.answerRepo.save(attemptAnswer);

    // cập nhật currentQuestionIndex đơn giản dựa trên số câu đã trả lời
    const answeredCount = await this.answerRepo.count({
      where: { session: { id: session.id } },
    });
    session.currentQuestionIndex = answeredCount;

    return this.sessionRepo.save(session);
  }

  async finishSession(
    sessionId: string,
    studentId: string,
  ): Promise<AssessmentSession> {
    const session = await this.getSession(sessionId, studentId);

    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session already finished');
    }

    const answers = await this.answerRepo.find({
      where: { session: { id: session.id } },
    });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    session.score = correctCount;
    session.status = SessionStatus.COMPLETED;
    session.finishedAt = new Date();

    return this.sessionRepo.save(session);
  }
}
