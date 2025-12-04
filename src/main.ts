import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('ITS – Intelligent Tutoring System')
    .setDescription('Backend API for the ITS platform')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // name used in @ApiBearerAuth('access-token')
    )
    .addTag('auth', 'Authentication & user management')
    .addTag('courses', 'Course management')
    .addTag('lessons', 'Lessons & content (text + media)')
    .addTag('quizzes', 'Quizzes & questions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps JWT after refresh
    },
  });

  app.use('/api-json', (req, res) => res.json(document));
  await app.listen(3000);
  console.log(`API running → http://localhost:3000`);
  console.log(`Swagger UI → http://localhost:3000/api`);
}
bootstrap();