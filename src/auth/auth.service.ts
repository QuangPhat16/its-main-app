// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { Student } from './entities/student.entity';
import { Instructor } from './entities/instructor.entity';
import { Admin } from './entities/admin.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './entities/user-role.enum';

// Type chung để các service khác dùng dễ dàng
export type AppUser = Student | Instructor | Admin;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Instructor)
    private instructorRepo: Repository<Instructor>,

    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,

    private jwtService: JwtService,
  ) {}

  // Helper: lấy đúng repository theo role
  private getRepository(role: UserRole): Repository<AppUser> {
    switch (role) {
      case UserRole.ADMIN:
        return this.adminRepo as Repository<AppUser>;
      case UserRole.INSTRUCTOR:
        return this.instructorRepo as Repository<AppUser>;
      case UserRole.STUDENT:
      default:
        return this.studentRepo as Repository<AppUser>;
    }
  }

  // =================================================================
  // ĐĂNG KÝ – Tạo user vào đúng bảng theo role
  // =================================================================
  async register(dto: RegisterDto): Promise<any> {
    const role = dto.role || UserRole.STUDENT;
    const repo = this.getRepository(role);

    // Kiểm tra email đã tồn tại trong bất kỳ bảng nào
    const exists = await this.findUserByEmailInAllTables(dto.email);
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    // Tạo instance đúng class để @BeforeInsert hash password hoạt động
    let user: AppUser;
    switch (role) {
      case UserRole.ADMIN:
        user = this.adminRepo.create({ ...dto, role });
        break;
      case UserRole.INSTRUCTOR:
        user = this.instructorRepo.create({ ...dto, role });
        break;
      case UserRole.STUDENT:
      default:
        user = this.studentRepo.create({ ...dto, role });
        break;
    }

    const savedUser = await repo.save(user);
    return this.login(savedUser);
  }

  // =================================================================
  // ĐĂNG NHẬP LOCAL (email + password)
  // =================================================================
  async validateUser(email: string, password: string): Promise<AppUser | null> {
    const user = await this.findUserByEmailInAllTables(email);

    if (!user) return null;

    // Google-only user → không cho login bằng password
    if (!user.password) return null;

    const isValid = await (user as any).validatePassword(password);
    if (!isValid) return null;

    return user;
  }

  // =================================================================
  // GOOGLE OAuth – tìm hoặc tạo user
  // =================================================================
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name?: string;
    role?: UserRole;
  }): Promise<AppUser> {
    const role = profile.role || UserRole.STUDENT;
    const repo = this.getRepository(role);

    // 1. Tìm theo googleId trước
    let user = await this.findUserByGoogleIdInAllTables(profile.googleId);

    // 2. Nếu không có thì tìm theo email (có thể là tài khoản local cũ)
    if (!user) {
      user = await this.findUserByEmailInAllTables(profile.email);
    }

    // 3. Nếu vẫn không có → tạo mới
    if (!user) {
      const newUser = repo.create({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        role,
      });
      user = await repo.save(newUser);
    } else {
      // Liên kết googleId nếu chưa có
      if (!user.googleId) {
        user.googleId = profile.googleId;
        if (profile.name && !user.name) user.name = profile.name;
        await repo.save(user);
      }
    }

    return user;
  }

  // =================================================================
  // JWT LOGIN – trả token + info user
  // =================================================================
  async login(user: AppUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role,
      },
    };
  }

  // =================================================================
  // Helper functions – tìm user trong 3 bảng
  // =================================================================
  private async findUserByEmailInAllTables(email: string): Promise<AppUser | null> {
    const repos = [this.studentRepo, this.instructorRepo, this.adminRepo];
    for (const repo of repos) {
      const found = await repo.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'googleId', 'name', 'role', 'createdAt'],
      } as any);
      if (found) return found;
    }
    return null;
  }

  private async findUserByGoogleIdInAllTables(googleId: string): Promise<AppUser | null> {
    const repos = [this.studentRepo, this.instructorRepo, this.adminRepo];
    for (const repo of repos) {
      const found = await repo.findOne({ where: { googleId } } as any);
      if (found) return found;
    }
    return null;
  }

  // Optional: dùng ở các service khác để lấy full user + relations
  async findUserById(id: number, role?: UserRole): Promise<AppUser | null> {
    if (role) {
      return this.getRepository(role).findOne({ where: { id } } as any);
    }

<<<<<<< HEAD
    // Nếu không biết role → tìm lần lượt
    const repos = [this.studentRepo, this.instructorRepo, this.adminRepo];
    for (const repo of repos) {
      const found = await repo.findOne({ where: { id } } as any);
      if (found) return found;
    }
    return null;
=======
    await this.userRepo.save(user);
    return user;
  }

  // Optional: helper to get full user with correct type (useful in other services)
  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
>>>>>>> master
  }
}