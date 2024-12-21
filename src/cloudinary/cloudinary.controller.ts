import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class CloudinaryController {
  private readonly logger = new Logger(CloudinaryController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
  }))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // 파일 정보 로깅
      this.logger.debug(`Received file: ${file.originalname}`);

      const url = await this.cloudinaryService.uploadImage(file);
      return { url };
    } catch (error) {
      this.logger.error('Error in uploadSingle:', error);
      throw error;
    }
  }
}