import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course_management/modules/course.module';
// ... other modules

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432), // Built-in default + type conversion
        username: configService.get<string>('DB_USER', 'its_user'),
        password: configService.get<string>('DB_PASSWORD', 'its_password'),
        database: configService.get<string>('DB_NAME', 'its_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
        ssl: false,
        // ssl: {
        //   rejectUnauthorized: false, // For development; set to true in production with CA cert
        // },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CourseModule,
    // ...
  ],
  controllers: [AppController],    
  providers: [AppService],
})
export class AppModule {}