import { Entity, PrimaryGeneratedColumn, Column, OneToMany , ManyToOne, JoinColumn} from 'typeorm';
import { Course } from './course.entity';

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',//image url
  VIDEO = 'video',//video url
  AUDIO = 'audio'//audio url
}

@Entity('lesson')
export class Lesson {

  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column()
  lessonName: string;

  // One Lesson has many LessonContents
  @OneToMany(() => LessonContent, (content) => content.lesson, {
    cascade: true, // optional: auto-save contents when saving lesson
    eager: false,  // set true if you want contents loaded automatically
  })
  contents: LessonContent[];

  @ManyToOne(()=> Course, (course) => course.lessons, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'courseId'})
  course: Course

}

@Entity('lessonContent')
export class LessonContent {

  @PrimaryGeneratedColumn('uuid')
  id: string;  // type is string, not UUID from crypto

  @Column()
  serial: number; //To maintain the order of lesson contents

  @Column({nullable: true})
  contentName: string

  @Column({type: 'enum', enum: ContentType, default: ContentType.TEXT})
  type: ContentType

  @Column()
  content: string;// for text content

  @Column()
  url: string;//for media content


  @ManyToOne(() => Lesson, (lesson) => lesson.contents, {
    onDelete: 'CASCADE', // if lesson deleted, delete all contents
  })
  @JoinColumn({ name: 'lessonId' }) // creates lessonId column
  lesson: Lesson;

}