import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question, Answer } from '../entities/quiz.entity';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from '../dto/dtos';
import { CourseService } from './course.service';

@Injectable()
export class QuizService {
   constructor(
      private courseService: CourseService,
      @InjectRepository(Quiz)
      private quizRepo: Repository<Quiz>,
      @InjectRepository(Question)
      private questionRepo: Repository<Question>,
      @InjectRepository(Answer)
      private answerRepo: Repository<Answer>,
   ) {}

   async createQuiz(courseId: string, instructorId: string, dto: CreateQuizDto): Promise<Quiz> {
      const course = await this.courseService.verifyCourseOwnership(courseId, instructorId);
      const quiz = this.quizRepo.create({ ...dto, course });
      quiz.questions = await Promise.all(
         dto.questions.map(async (qDto) => {
         const question = this.questionRepo.create({ questionName: qDto.questionName, quiz });
         question.answers = qDto.answers.map((aDto) => this.answerRepo.create({ ...aDto, question }));
         return question;
         }),
      );
      return this.quizRepo.save(quiz);
   }

   async getQuizzesByCourse(courseId: string, loadQuestions = false): Promise<Quiz[]> {
      const relations = loadQuestions ? ['questions', 'questions.answers', 'course'] : ['course'];
      return this.quizRepo.find({ where: { course: { id: courseId } }, relations });
   }

   async getQuizById(id: string, loadRelations = false): Promise<Quiz> {
      const relations = loadRelations ? ['course', 'questions', 'questions.answers'] : ['course'];
      const quiz = await this.quizRepo.findOne({ where: { id }, relations });
      if (!quiz) {
         throw new NotFoundException(`Quiz with ID ${id} not found`);
      }
      return quiz;
   }

   async updateQuiz(id: string, instructorId: string, dto: UpdateQuizDto): Promise<Quiz> {
      const quiz = await this.getQuizById(id);
      await this.courseService.verifyCourseOwnership(quiz.course.id, instructorId);
      Object.assign(quiz, dto);
      return this.quizRepo.save(quiz);
   }

   async deleteQuiz(id: string, instructorId: string): Promise<void> {
      const quiz = await this.getQuizById(id);
      await this.courseService.verifyCourseOwnership(quiz.course.id, instructorId);
      await this.quizRepo.remove(quiz);
   }

   async createQuestion(quizId: string, instructorId: string, dto: CreateQuestionDto): Promise<Question> {
      const quiz = await this.getQuizById(quizId);
      await this.courseService.verifyCourseOwnership(quiz.course.id, instructorId);
      const question = this.questionRepo.create({ questionName: dto.questionName, quiz });
      question.answers = dto.answers.map((aDto) => this.answerRepo.create({ ...aDto, question }));
      return this.questionRepo.save(question);
   }

   async deleteQuestion(id: string, instructorId: string): Promise<void> {
      const question = await this.questionRepo.findOne({
         where: { id },
         relations: ['quiz', 'quiz.course'],
      });
      if (!question) {
         throw new NotFoundException(`Question with ID ${id} not found`);
      }
      await this.courseService.verifyCourseOwnership(question.quiz.course.id, instructorId);
      await this.questionRepo.remove(question);
   }
}