import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    // 환경변수 로깅
    this.logger.debug(`Cloud Name: ${cloudName}`);
    this.logger.debug(`API Key: ${apiKey}`);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.configService.get('CLOUDINARY_FOLDER'),
          },
          (error, result) => {
            if (error) {
              this.logger.error('Upload failed:', error);
              return reject(error);
            }
            resolve(result.secure_url);
          },
        );

        // 파일 데이터 확인
        this.logger.debug(`File size: ${file.size}`);
        this.logger.debug(`File type: ${file.mimetype}`);

        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      throw error;
    }
  }
}