import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Course } from './entities/course.entity';
import { Lesson, LessonContent } from './entities/lesson.entity';
import { Quiz, Question, Answer } from './entities/quiz.entity';
import { Instructor } from '../auth/entities/user.entity'; // Assuming path
import { CreateCourseDto, UpdateCourseDto, CreateLessonDto, UpdateLessonDto, CreateLessonContentDto, CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto/dtos';


@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(Course)
      private courseRepo: Repository<Course>,
      @InjectRepository(Lesson)
      private lessonRepo: Repository<Lesson>,
      @InjectRepository(LessonContent)
      private contentRepo: Repository<LessonContent>,
      @InjectRepository(Quiz)
      private quizRepo: Repository<Quiz>,
      @InjectRepository(Question)
      private questionRepo: Repository<Question>,
      @InjectRepository(Answer)
      private answerRepo: Repository<Answer>,
   ) {}

   // Course CRUD
   //Create course by instructor only
   async createCourse(instructor: Instructor, dto: CreateCourseDto): Promise<Course> {
      const course = this.courseRepo.create({
      ...dto,
      instructor,
      });
      return this.courseRepo.save(course);
   }

   async getAllCourses(): Promise<Course[]> {
      return this.courseRepo.find({
         relations: ['instructor'],
      });
   }

   async getCourseById(id: string, loadRelations = false): Promise<Course> {
      const relations = loadRelations
      ? ['instructor', 'lessons', 'lessons.contents', 'quizzes', 'quizzes.questions', 'quizzes.questions.answers']
      : ['instructor'];
      const course = await this.courseRepo.findOne({
      where: { id },
      relations,
      });
      if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return course;
   }

   async updateCourse(id: string, instructorId: number, dto: UpdateCourseDto): Promise<Course> {
      const course = await this.getCourseById(id);
      if (course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only update your own courses');
      }
      Object.assign(course, dto);
      return this.courseRepo.save(course);
   }

   async deleteCourse(id: string, instructorId: number): Promise<void> {
      const course = await this.getCourseById(id);
      if (course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only delete your own courses');
      }
      await this.courseRepo.remove(course);
   }

   // Lesson CRUD

   async createLesson(courseId: string, instructorId: number, dto: CreateLessonDto): Promise<Lesson> {
      const course = await this.getCourseById(courseId);
      if (course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only add lessons to your own courses');
      }

      const lesson = this.lessonRepo.create({
      ...dto,
      course,
      });

      // Create contents
      lesson.contents = dto.contents.map((contentDto) =>
      this.contentRepo.create({
         ...contentDto,
         lesson,
      }),
      );

      return this.lessonRepo.save(lesson);
   }

   async getLessonsByCourse(courseId: string, loadContents = false): Promise<Lesson[]> {
      const relations = loadContents ? ['contents', 'course'] : ['course'];
      return this.lessonRepo.find({
      where: { course: { id: courseId } },
      relations,
      });
   }

   async getLessonById(id: string, loadRelations = false): Promise<Lesson> {
      const relations = loadRelations ? ['course', 'contents'] : ['course'];
      const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations,
      });
      if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
      }
      return lesson;
   }

   async updateLesson(id: string, instructorId: number, dto: UpdateLessonDto): Promise<Lesson> {
      const lesson = await this.getLessonById(id);
      if (lesson.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only update lessons in your own courses');
      }
      Object.assign(lesson, dto);
      return this.lessonRepo.save(lesson);
   }

   async deleteLesson(id: string, instructorId: number): Promise<void> {
      const lesson = await this.getLessonById(id);
      if (lesson.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only delete lessons in your own courses');
      }
      await this.lessonRepo.remove(lesson);
   }

   // Quiz CRUD

   async createQuiz(courseId: string, instructorId: number, dto: CreateQuizDto): Promise<Quiz> {
      const course = await this.getCourseById(courseId);
      if (course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only add quizzes to your own courses');
      }

      const quiz = this.quizRepo.create({
      ...dto,
      course,
      });

      // Create questions with answers
      quiz.questions = await Promise.all(
      dto.questions.map(async (qDto) => {
         const question = this.questionRepo.create({
            questionName: qDto.questionName,
            quiz,
         });
         question.answers = qDto.answers.map((aDto) =>
            this.answerRepo.create({
            ...aDto,
            question,
            }),
         );
         return question;
      }),
      );

      return this.quizRepo.save(quiz);
   }

   async getQuizzesByCourse(courseId: string, loadQuestions = false): Promise<Quiz[]> {
      const relations = loadQuestions ? ['questions', 'questions.answers', 'course'] : ['course'];
      return this.quizRepo.find({
      where: { course: { id: courseId } },
      relations,
      });
   }

   async getQuizById(id: string, loadRelations = false): Promise<Quiz> {
      const relations = loadRelations ? ['course', 'questions', 'questions.answers'] : ['course'];
      const quiz = await this.quizRepo.findOne({
      where: { id },
      relations,
      });
      if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
      }
      return quiz;
   }

   async updateQuiz(id: string, instructorId: number, dto: UpdateQuizDto): Promise<Quiz> {
      const quiz = await this.getQuizById(id);
      if (quiz.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only update quizzes in your own courses');
      }
      Object.assign(quiz, dto);
      return this.quizRepo.save(quiz);
   }

   async deleteQuiz(id: string, instructorId: number): Promise<void> {
      const quiz = await this.getQuizById(id);
      if (quiz.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only delete quizzes in your own courses');
      }
      await this.quizRepo.remove(quiz);
   }

   // LessonContent: Create and Delete only

   async createLessonContent(lessonId: string, instructorId: number, dto: CreateLessonContentDto): Promise<LessonContent> {
      const lesson = await this.getLessonById(lessonId);
      if (lesson.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only add content to lessons in your own courses');
      }

      const content = this.contentRepo.create({
      ...dto,
      lesson,
      });
      return this.contentRepo.save(content);
   }

   async deleteLessonContent(id: string, instructorId: number): Promise<void> {
      const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['lesson', 'lesson.course', 'lesson.course.instructor'],
      });
      if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
      }
      if (content.lesson.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only delete content from your own courses');
      }
      await this.contentRepo.remove(content);
   }

   // Question: Create and Delete only

   async createQuestion(quizId: string, instructorId: number, dto: CreateQuestionDto): Promise<Question> {
      const quiz = await this.getQuizById(quizId);
      if (quiz.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only add questions to quizzes in your own courses');
      }

      const question = this.questionRepo.create({
      questionName: dto.questionName,
      quiz,
      });

      question.answers = dto.answers.map((aDto) =>
      this.answerRepo.create({
         ...aDto,
         question,
      }),
      );

      return this.questionRepo.save(question);
   }

   async deleteQuestion(id: string, instructorId: number): Promise<void> {
      const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['quiz', 'quiz.course', 'quiz.course.instructor'],
      });
      if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
      }
      if (question.quiz.course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only delete questions from your own courses');
      }
      await this.questionRepo.remove(question);
   }
}