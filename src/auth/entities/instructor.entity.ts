import { Entity, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { UserRole } from './user-role.enum';
import { Course } from '../../course_management/entities/course.entity';

@Entity('instructor')
export class Instructor extends BaseUser {
  @OneToMany(() => Course, (course) => course.instructor, { cascade: true })
  courses: Course[];

  constructor(data?: Partial<Instructor>) {
    super();
    if (data) {
      Object.assign(this, { ...data, role: UserRole.INSTRUCTOR });
    }
  }
}