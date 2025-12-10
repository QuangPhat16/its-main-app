import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost, } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

@Injectable()
export class MediaService {
   constructor(
      private config: ConfigService,
      @Inject('S3_CLIENT') private s3Client: S3Client,
   ) {}

   // CREATE: Generate pre-signed POST URL for FE to upload
   async generateUploadUrl(fileName: string, mimeType: string): Promise<{ url: string; fields: any; key: string }> {
      const bucket = this.config.get('AWS_S3_BUCKET');
      const key = `lessons/media/${uuidv4()}-${fileName}`; // Unique key/path

      const { url, fields } = await createPresignedPost(this.s3Client, {
         Bucket: bucket,
         Key: key,
         Conditions: [
         ['content-length-range', 0, 10485760], // Max 10MB
         // { acl: 'public-read' }, // Or private if needed
         ['starts-with', '$Content-Type', mimeType],
         ],
         Fields: { 'Content-Type': mimeType },
         Expires: 900, // 15 mins
      });

      return { url, fields, key };
   }

   // Get public S3 URL from key (after FE confirms upload)
   getPublicUrl(key: string): string {
      const bucket = this.config.get('AWS_S3_BUCKET');
      const region = this.config.get('AWS_REGION');
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
   }

   // DELETE: Backend deletes directly (secure), or generate pre-signed DELETE if FE must handle
   async deleteFromS3(key: string): Promise<void> {
      const bucket = this.config.get('AWS_S3_BUCKET');
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
   }

   // Optional: Pre-signed GET URL for private files (if not public-read)
   async generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
      const bucket = this.config.get('AWS_S3_BUCKET');
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(this.s3Client, command, { expiresIn });
   }
}