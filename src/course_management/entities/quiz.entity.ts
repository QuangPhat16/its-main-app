import { Entity, PrimaryGeneratedColumn, Column, OneToMany , ManyToOne, JoinColumn} from 'typeorm';
import { Course } from './course.entity';


@Entity('quiz')
export class Quiz{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({default: 30})
  timeLimit: number;

  @OneToMany(()=>Question, (question) => question.quiz, {
    cascade: true,     // Saves questions & answers automatically
    eager: false
  })
  questions: Question[];

  @ManyToOne(() => Course, (course) => course.quizzes, { onDelete: 'CASCADE'})
  @JoinColumn({name: 'CourseId'})
  course: Course
}


@Entity('question')
export class Question {

  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column()
  questionName: string;

  // Has many answers
  @OneToMany(() => Answer, (answer) => answer.question, {
    // cascade: true, 
    eager: true, //auto load answers when retriving a question
  })
  answers: Answer[];

  // Belong to many quizzes
  @ManyToOne(() => Quiz, (quiz) =>quiz.questions, {})
  @JoinColumn({name: 'quizId'})
  quiz: Quiz;

}


@Entity('answer')
export class Answer {

  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column()
  correct: boolean;

  @Column()
  content: string;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE', 
  })
  @JoinColumn({ name: 'questionId' }) 
  question: Question;

}