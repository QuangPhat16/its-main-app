import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import {Instructor} from "../../auth/entities/user.entity";
import { Lesson } from './lesson.entity';
import { Quiz } from './quiz.entity';


@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column()
  courseName: string;

  @Column({nullable: true})
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0})
  price: number;

  @OneToMany(() => Lesson, (lesson) => lesson.course, {
    cascade: true,
    eager: false
  })
  lessons: Lesson[];

  @OneToMany(() => Quiz, (quiz) => quiz.course, {
    cascade: true,
    eager: false
  })
  quizzes: Quiz[];

  @ManyToOne(()=> Instructor, (instructor) => instructor.courses, {})
  @JoinColumn({name: 'instructorId'})
  instructor: Instructor

}
