import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Log configuration status (without exposing secrets)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      this.logger.log(`Cloudinary configured for: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    } else {
      this.logger.warn('Cloudinary not configured - check environment variables');
    }
  }

  /**
   * Upload an image to Cloudinary
   * @param fileBuffer - The file buffer to upload
   * @param filename - The filename (will be used as public_id)
   * @param folder - Optional folder name in Cloudinary (default: 'homezy')
   * @returns The secure URL of the uploaded image
   */
  async uploadImage(
    fileBuffer: Buffer,
    filename: string,
    folder: string = 'homezy'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          resource_type: 'image',
          transformation: [
            { quality: 'auto' }, // Auto-optimize quality
            { fetch_format: 'auto' }, // Auto-select best format
          ],
        },
        (error: any, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          this.logger.log(`Image uploaded: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
    } catch (error) {
      this.logger.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
}
