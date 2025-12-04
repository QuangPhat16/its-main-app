import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { MediaService } from '../services/media.service'; // We'll create this

@Module({
  imports: [ConfigModule],
  providers: [
    MediaService,
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
            region: configService.get<string>('AWS_REGION', 'ap-southeast-1'),
            credentials: {
               accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', 'access_key'),
               secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY', 'access_key_secret'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}