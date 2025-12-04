import { Entity } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { UserRole } from './user-role.enum';

@Entity('student') // tên bảng trong DB của bạn
export class Student extends BaseUser {
  constructor(data?: Partial<Student>) {
    super();
    if (data) {
      Object.assign(this, { ...data, role: UserRole.STUDENT });
    }
  }
}