import {
  Controller,
  Post,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
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
      if (!data.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        throw new BadRequestException('Only image files are allowed!');
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(data.filename);
      const filename = `${uniqueSuffix}${ext}`;
      const filePath = path.join('./uploads', filename);

      // Save file
      await pipeline(data.file, fs.createWriteStream(filePath));

      // Return the file URL
      const fileUrl = `http://localhost:3003/uploads/${filename}`;
      return {
        url: fileUrl,
        filename: filename,
        originalname: data.filename,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('File upload failed');
    }
  }
} 