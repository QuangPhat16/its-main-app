import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Student } from 'src/auth/entities/user.entity';
import {
  Quiz,
  Question,
  Answer,
} from 'src/course_management/entities/quiz.entity';

export enum SessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('assessment_session')
export class AssessmentSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Quiz, { eager: true })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  status: SessionStatus;

  @Column({ default: 0 })
  currentQuestionIndex: number;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ type: 'int', nullable: true })
  score: number | null; // tùy, bạn có thể tính ở AssessmentEngine

  @OneToMany(() => AssessmentAnswer, (ans) => ans.session, {
    cascade: true,
    eager: true,
  })
  answers: AssessmentAnswer[];

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;
}

@Entity('assessment_answer')
export class AssessmentAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssessmentSession, (session) => session.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: AssessmentSession;

  @ManyToOne(() => Question, { eager: true })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @ManyToOne(() => Answer, { eager: true, nullable: true })
  @JoinColumn({ name: 'selectedAnswerId' })
  selectedAnswer: Answer | null;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;
}
