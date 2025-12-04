import { Entity } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { UserRole } from './user-role.enum';

@Entity('admin')
export class Admin extends BaseUser {
  constructor(data?: Partial<Admin>) {
    super();
    if (data) {
      Object.assign(this, { ...data, role: UserRole.ADMIN });
    }
  }
}