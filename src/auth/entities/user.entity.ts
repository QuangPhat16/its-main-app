import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Course } from 'src/course_management/entities/course.entity';


export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export abstract class BaseUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}

// 3 bảng riêng biệt – map đúng tên bảng bạn đã tạo sẵn
@Entity('student')
export class Student extends BaseUser {
  constructor(data?: Partial<Student>) {
    super();
    Object.assign(this, { ...data, role: UserRole.STUDENT });
  }
}

@Entity('instructor')
export class Instructor extends BaseUser {
  @OneToMany(() => Course, (course) => course.instructor, { cascade: true })
  courses: Course[];

  constructor(data?: Partial<Instructor>) {
    super();
    Object.assign(this, { ...data, role: UserRole.INSTRUCTOR });
  }
}

@Entity('admin')
export class Admin extends BaseUser {
  constructor(data?: Partial<Admin>) {
    super();
    Object.assign(this, { ...data, role: UserRole.ADMIN });
  }
}