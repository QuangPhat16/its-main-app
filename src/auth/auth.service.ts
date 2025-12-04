import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, Student, Instructor } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  //A factory method to create new user
  private createUserEntity(data: Partial<User>, role?: UserRole): User {
    const finalRole = role || UserRole.STUDENT;
    switch (finalRole) {
      case UserRole.INSTRUCTOR:
        return Object.assign(new Instructor(), { ...data, role: finalRole });
      default:
        return Object.assign(new Student(), { ...data, role: finalRole });
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {//When login
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name', 'googleId'],
    });

    if (!user) return null;

    // Google-only users have no password
    if (!user.password) {
      return null; // Cannot login with email/password
    }

    const isValid = await this.validatePassword(password, user.password);
    if (!isValid) return null;

    return user;
  }

  async login(user: User) {//After resiter
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
        role: user.role,
        name: user.name || null,
      },
    };
  }

  async register(dto: RegisterDto): Promise<any> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email }, } );
    if (existing) {throw new ConflictException('Email already in use');}

    const user = this.createUserEntity(dto, dto.role);
    const savedUser = await this.userRepo.save(user);
    return this.login(savedUser);
  }

  // Google OAuth 
  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name?: string;
    role?: UserRole;
  }) {
    let user = await this.userRepo.findOne({
      where: [{ googleId: data.googleId }, { email: data.email }],
    });

    if (!user) {
      user = this.createUserEntity(data, data.role);

    } else if (!user.googleId) {
      // Link existing local account
      user.googleId = data.googleId;
      if (data.name && !user.name) user.name = data.name;
    }

    await this.userRepo.save(user);
    return user;
  }

  // Optional: helper to get full user with correct type (useful in other services)
  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }
}