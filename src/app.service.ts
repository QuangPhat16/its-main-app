import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; docs: string } {
    return {
      message: 'Welcome to ITS API - Intelligent Tutoring System',
      version: '1.0.0',
      docs: '/api', // Swagger UI path
    };
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

}