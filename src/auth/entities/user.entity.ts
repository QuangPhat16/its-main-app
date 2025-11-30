import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Course } from 'src/course_management/entities/course.entity'; // Updated path (rename folder!)

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

@Entity('users')
export abstract class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string; // null for Google users

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn() // Removed invalid default—TypeORM handles it
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
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

@Entity() 
export class Student extends User {
  // Add student-specific fields here, e.g.:
}

@Entity() 
export class Instructor extends User {
  @OneToMany(() => Course, (course) => course.instructor, { cascade: true })
  courses: Course[];
}

@Entity() // Add this if using ADMIN role
export class Admin extends User {
  // Add admin-specific fields if needed
}