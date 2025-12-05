import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import {Instructor} from "../../auth/entities/user.entity";
import { Lesson } from './lesson.entity';
import { Quiz } from './quiz.entity';

export enum CourseStatus{
  DRAFT = 'draft',
  PUBLISH = 'publish'
}

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column()
  title: string;

  @Column({nullable: true})
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0})
  price: number;

  @Column({type: 'enum', enum: CourseStatus, default: CourseStatus.PUBLISH})
  status: CourseStatus

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

  @ManyToOne(()=> Instructor, (instructor) => instructor.courses, {eager: false})
  @JoinColumn({name: 'instructorId'})
  instructor: Instructor

}
