// quiz-attempt.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('quiz_attempt')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  studentId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date;

  // [{ questionId: string, answerId: string }]
  @Column({ type: 'jsonb', default: [] })
  answers: { questionId: string; answerId: string }[];

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  timeTaken: number; // seconds
}