import {
  Controller,
  Post,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as path from 'path';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@Request() req: any) {
    try {
      // Fastify multipart handling
      const data = await req.file();
      
      if (!data) {
        throw new BadRequestException('No file uploaded');
      }

      // Check file type
      if (!data.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        throw new BadRequestException('Only image files are allowed!');
      }

      // Check file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      let fileSize = 0;

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk as Buffer);
        fileSize += (chunk as Buffer).length;
        
        if (fileSize > MAX_SIZE) {
          throw new BadRequestException('File size exceeds 5MB limit');
        }
      }
      const buffer = Buffer.concat(chunks);

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(data.filename);
      const filename = `${uniqueSuffix}${ext}`;

      // Upload to Cloudinary
      const url = await this.cloudinaryService.uploadImage(buffer, filename);
      
      this.logger.log(`📸 File uploaded to Cloudinary: ${filename}`);
      
      return {
        url: url,
        filename: filename,
        originalname: data.filename,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('File upload failed');
    }
  }
} 