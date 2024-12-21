import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';  // 추가

@Controller('upload')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    const url = await this.cloudinaryService.uploadImage(file);
    return { url };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 50, {
    storage: memoryStorage(),
  }))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.cloudinaryService.uploadMultipleImages(files);
    return { urls };
  }
}