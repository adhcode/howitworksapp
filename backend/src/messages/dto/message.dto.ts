import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiPropertyOptional({ example: 'Maintenance Request' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Hello, I need help with the air conditioning unit.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateMessageDto {
  @ApiPropertyOptional({ example: 'Updated message content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'Updated subject' })
  @IsOptional()
  @IsString()
  subject?: string;
}

export class CreateMaintenanceRequestDto {
  @ApiProperty({ example: 'Air conditioning not working' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The AC unit in the bedroom is not cooling properly. It makes strange noises and barely produces cold air.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiPropertyOptional({ example: ['image1.jpg', 'image2.jpg'] })
  @IsOptional()
  images?: string[];
} 