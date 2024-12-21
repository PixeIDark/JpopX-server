import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

type CloudinaryLib = {
  config: typeof cloudinary.config;
  uploader: typeof cloudinary.uploader;
};

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryLib: CloudinaryLib) {
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
}