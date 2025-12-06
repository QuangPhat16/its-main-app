import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from './entities/quizz.attempt.entity';
import { SubmitAttemptDto } from './dto/dtos';
import { Quiz, Question, Answer } from '../course_management/entities/quiz.entity';

@Injectable()
export class QuizAttemptService {
   constructor(
      @InjectRepository(QuizAttempt)
      private attemptRepo: Repository<QuizAttempt>,

      @InjectRepository(Quiz)
      private quizRepo: Repository<Quiz>,

      @InjectRepository(Question)
      private questionRepo: Repository<Question>,

      @InjectRepository(Answer)
      private answerRepo: Repository<Answer>,
   ) {}

   /** Start Attempt */
   async startAttempt(quizId: string, studentId: string) {
      const quiz = await this.quizRepo.findOne({ where: { id: quizId }, relations: ['questions', 'questions.answers']});
      if (!quiz) throw new NotFoundException('Quiz not found');

      // Create attempt record
      const attempt = this.attemptRepo.create({
         quizId,
         studentId,
         answers: []
      });

      await this.attemptRepo.save(attempt);

      return {
         attemptId: attempt.id,
         quiz,
      };
   }

   /** Submit Attempt */
   async submitAttempt(attemptId: string, studentId: string, dto: SubmitAttemptDto) {
      const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });
      if (!attempt) throw new NotFoundException('Attempt not found');
      if (attempt.studentId !== studentId) throw new ForbiddenException('Not your attempt');

      const quiz = await this.quizRepo.findOne({
         where: { id: attempt.quizId },
         relations: ['questions', 'questions.answers'],
      });

      if(!quiz) throw new NotFoundException('Quiz not found');

      let correct = 0;

      dto.answers.forEach(s => {
         const question = quiz.questions.find(q => q.id === s.questionId);
         if (!question) return;

         const answer = question.answers.find(a => a.id === s.answerId);
         const isCorrect = answer?.isCorrect ?? false;

         if (isCorrect) correct++;
      });

      attempt.answers = dto.answers;
      attempt.submittedAt = new Date();
      attempt.score = correct;
      attempt.timeTaken = Math.floor((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);

      await this.attemptRepo.save(attempt);

      return attempt;
   }

   /** Get Attempt Result */
   async getAttempt(attemptId: string, studentId: string) {
      const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });

      if (!attempt) throw new NotFoundException('Attempt not found');
      if (attempt.studentId !== studentId) throw new ForbiddenException('Not your attempt');

      return attempt;
   }
}
